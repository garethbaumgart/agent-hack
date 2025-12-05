using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;
using MyNote.Application.Common.Services;

namespace MyNote.Application.Features.Tasks;

public record UpdateTaskDueDateCommand : IRequest<UpdateTaskDueDateResult?>
{
    public Guid Id { get; init; }
    public DateTime? DueDate { get; init; }
}

public record UpdateTaskDueDateResult
{
    public TaskDto Task { get; init; } = null!;
    public Guid? NoteId { get; init; }
    public string? UpdatedNoteContent { get; init; }
}

public class UpdateTaskDueDateHandler(IApplicationDbContext context) : IRequestHandler<UpdateTaskDueDateCommand, UpdateTaskDueDateResult?>
{
    public async Task<UpdateTaskDueDateResult?> Handle(UpdateTaskDueDateCommand request, CancellationToken cancellationToken)
    {
        var task = await context.Tasks.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (task == null) return null;

        task.DueDate = request.DueDate;
        task.UpdatedAt = DateTime.UtcNow;

        string? updatedNoteContent = null;
        Guid? noteId = null;

        // If task is linked to a note checkbox, sync the due date to the note content
        if (task.NoteId.HasValue && !string.IsNullOrEmpty(task.CheckboxId))
        {
            var note = await context.Notes.FirstOrDefaultAsync(n => n.Id == task.NoteId.Value, cancellationToken);
            if (note != null && !string.IsNullOrEmpty(note.Content))
            {
                var dueDateStr = request.DueDate?.ToString("yyyy-MM-dd");
                updatedNoteContent = CheckboxParser.UpdateCheckboxDueDate(note.Content, task.CheckboxId, dueDateStr);
                if (updatedNoteContent != note.Content)
                {
                    note.Content = updatedNoteContent;
                    note.UpdatedAt = DateTime.UtcNow;
                    noteId = note.Id;
                }
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        return new UpdateTaskDueDateResult
        {
            Task = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Status = task.Status,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                StartedAt = task.StartedAt,
                CompletedAt = task.CompletedAt,
                DueDate = task.DueDate,
                NoteId = task.NoteId,
                CheckboxId = task.CheckboxId
            },
            NoteId = noteId,
            UpdatedNoteContent = updatedNoteContent
        };
    }
}
