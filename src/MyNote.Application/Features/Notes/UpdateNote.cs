using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;
using MyNote.Application.Common.Services;
using MyNote.Domain.Entities;

namespace MyNote.Application.Features.Notes;

public record UpdateNoteCommand : IRequest<UpdateNoteResult?>
{
    public Guid Id { get; init; }
    public string Content { get; init; } = string.Empty;
}

public record UpdateNoteResult
{
    public NoteDto Note { get; init; } = null!;
    public string UpdatedContent { get; init; } = string.Empty;
}

public class UpdateNoteHandler(IApplicationDbContext context) : IRequestHandler<UpdateNoteCommand, UpdateNoteResult?>
{
    public async Task<UpdateNoteResult?> Handle(UpdateNoteCommand request, CancellationToken cancellationToken)
    {
        // Load note with labels and existing tasks
        var note = await context.Notes
            .Include(n => n.NoteLabels)
            .ThenInclude(nl => nl.Label)
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note is null)
            return null;

        // Get existing tasks linked to this note
        var existingTasks = await context.Tasks
            .Include(t => t.TaskLabels)
            .Where(t => t.NoteId == note.Id && t.CheckboxId != null)
            .ToListAsync(cancellationToken);

        // Parse checkboxes from the new content
        var checkboxes = CheckboxParser.ParseCheckboxes(request.Content);
        var updatedContent = request.Content;

        // Track which existing tasks are still in the content
        var matchedTaskIds = new HashSet<string>();

        foreach (var checkbox in checkboxes)
        {
            if (!string.IsNullOrEmpty(checkbox.Id))
            {
                // Checkbox already has a task ID - find the existing task
                var existingTask = existingTasks.FirstOrDefault(t => t.CheckboxId == checkbox.Id);
                if (existingTask != null)
                {
                    matchedTaskIds.Add(checkbox.Id);

                    // US-25: Update task title if changed
                    if (existingTask.Title != checkbox.Text)
                    {
                        existingTask.Title = checkbox.Text;
                        existingTask.UpdatedAt = DateTime.UtcNow;
                    }

                    // US-22: Update task status based on checkbox state
                    var newStatus = checkbox.IsChecked ? "done" : "todo";
                    if (existingTask.Status != newStatus)
                    {
                        existingTask.Status = newStatus;
                        existingTask.UpdatedAt = DateTime.UtcNow;
                        existingTask.CompletedAt = checkbox.IsChecked ? DateTime.UtcNow : null;
                    }

                    // US-27: Sync due date from checkbox to task
                    DateTime? parsedDueDate = null;
                    if (!string.IsNullOrEmpty(checkbox.DueDate) && DateTime.TryParse(checkbox.DueDate, out var parsed))
                    {
                        parsedDueDate = parsed;
                    }
                    if (existingTask.DueDate != parsedDueDate)
                    {
                        existingTask.DueDate = parsedDueDate;
                        existingTask.UpdatedAt = DateTime.UtcNow;
                    }
                }
            }
            else
            {
                // US-20 & US-23: New checkbox without task ID - create a new task
                var newTaskId = Guid.NewGuid().ToString();
                var task = new TaskItem
                {
                    Id = Guid.NewGuid(),
                    Title = checkbox.Text,
                    Status = checkbox.IsChecked ? "done" : "todo",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CompletedAt = checkbox.IsChecked ? DateTime.UtcNow : null,
                    NoteId = note.Id,
                    CheckboxId = newTaskId
                };

                context.Tasks.Add(task);

                // Inherit labels from note
                foreach (var noteLabel in note.NoteLabels)
                {
                    context.TaskLabels.Add(new TaskLabel
                    {
                        TaskId = task.Id,
                        LabelId = noteLabel.LabelId
                    });
                }

                // Update the HTML content to include the task ID and labels
                var labelNames = note.NoteLabels.Select(nl => nl.Label.Name).ToList();
                updatedContent = AddTaskIdToCheckbox(updatedContent, checkbox.Text, checkbox.IsChecked, newTaskId, labelNames);
            }
        }

        // US-24: Delete tasks whose checkboxes were removed
        var checkboxIdsInContent = checkboxes
            .Where(c => !string.IsNullOrEmpty(c.Id))
            .Select(c => c.Id)
            .ToHashSet();

        foreach (var task in existingTasks)
        {
            if (!string.IsNullOrEmpty(task.CheckboxId) && !matchedTaskIds.Contains(task.CheckboxId) && !checkboxIdsInContent.Contains(task.CheckboxId))
            {
                // Remove task labels first
                var taskLabels = await context.TaskLabels
                    .Where(tl => tl.TaskId == task.Id)
                    .ToListAsync(cancellationToken);
                context.TaskLabels.RemoveRange(taskLabels);

                context.Tasks.Remove(task);
            }
        }

        // Update note content with task IDs embedded
        note.Content = updatedContent;
        note.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return new UpdateNoteResult
        {
            Note = new NoteDto
            {
                Id = note.Id,
                Content = note.Content,
                CreatedAt = note.CreatedAt,
                UpdatedAt = note.UpdatedAt,
                Labels = note.NoteLabels.Select(nl => new NoteLabelDto
                {
                    Id = nl.Label.Id,
                    Name = nl.Label.Name
                }).ToList()
            },
            UpdatedContent = updatedContent
        };
    }

    private static string AddTaskIdToCheckbox(string content, string text, bool isChecked, string taskId, List<string> labels)
    {
        var checkedAttr = isChecked ? "true" : "false";
        var escapedText = System.Text.RegularExpressions.Regex.Escape(text);

        // Build the additional attributes
        var additionalAttrs = $@" data-task-id=""{taskId}""";
        if (labels.Any())
        {
            var labelsStr = string.Join(", ", labels);
            additionalAttrs += $@" data-labels=""{labelsStr}""";
        }

        // Try Tiptap nested format first: <li class="task-item" data-checked="false" data-type="taskItem">...<p>text</p>...</li>
        // We need to find <li> tags with data-type="taskItem" that contain the text in a <p> tag
        // and don't already have a data-task-id attribute
        var nestedPattern = $@"(<li[^>]*data-type=""taskItem""[^>]*data-checked=""{checkedAttr}""(?![^>]*data-task-id)[^>]*)>(.*?<p>){escapedText}(</p>.*?</li>)";
        var nestedReplacement = $@"$1{additionalAttrs}>$2{text}$3";
        var result = System.Text.RegularExpressions.Regex.Replace(content, nestedPattern, nestedReplacement,
            System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Singleline);

        // Try alternative order: data-checked before data-type
        if (result == content)
        {
            nestedPattern = $@"(<li[^>]*data-checked=""{checkedAttr}""[^>]*data-type=""taskItem""(?![^>]*data-task-id)[^>]*)>(.*?<p>){escapedText}(</p>.*?</li>)";
            result = System.Text.RegularExpressions.Regex.Replace(content, nestedPattern, nestedReplacement,
                System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Singleline);
        }

        // Fall back to simple format: <li data-type="taskItem" data-checked="false">text</li>
        if (result == content)
        {
            var simplePattern = $@"(<li[^>]*data-type=""taskItem""[^>]*data-checked=""{checkedAttr}""(?![^>]*data-task-id)[^>]*)>({escapedText})</li>";
            var simpleReplacement = $@"$1{additionalAttrs}>$2</li>";
            result = System.Text.RegularExpressions.Regex.Replace(content, simplePattern, simpleReplacement, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        }

        // Try alternative simple format order
        if (result == content)
        {
            var simplePattern = $@"(<li[^>]*data-checked=""{checkedAttr}""[^>]*data-type=""taskItem""(?![^>]*data-task-id)[^>]*)>({escapedText})</li>";
            var simpleReplacement = $@"$1{additionalAttrs}>$2</li>";
            result = System.Text.RegularExpressions.Regex.Replace(content, simplePattern, simpleReplacement, System.Text.RegularExpressions.RegexOptions.IgnoreCase);
        }

        return result;
    }
}
