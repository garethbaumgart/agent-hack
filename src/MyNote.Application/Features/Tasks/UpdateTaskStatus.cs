using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;
using MyNote.Application.Common.Services;

namespace MyNote.Application.Features.Tasks;

public record UpdateTaskStatusCommand : IRequest<UpdateTaskStatusResult?>
{
    public Guid Id { get; init; }
    public string Status { get; init; } = string.Empty;
}

public record UpdateTaskStatusResult
{
    public TaskDto Task { get; init; } = null!;
    public Guid? NoteId { get; init; }
    public string? UpdatedNoteContent { get; init; }
}

public class UpdateTaskStatusHandler(IApplicationDbContext context) : IRequestHandler<UpdateTaskStatusCommand, UpdateTaskStatusResult?>
{
    public async Task<UpdateTaskStatusResult?> Handle(UpdateTaskStatusCommand request, CancellationToken cancellationToken)
    {
        var task = await context.Tasks
            .Include(t => t.TaskLabels)
            .ThenInclude(tl => tl.Label)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (task == null) return null;

        task.Status = request.Status;
        task.UpdatedAt = DateTime.UtcNow;
        task.CompletedAt = request.Status == "done" ? DateTime.UtcNow : null;

        string? updatedNoteContent = null;

        // US-21: If task is linked to a note, update the checkbox in the note
        if (task.NoteId.HasValue && !string.IsNullOrEmpty(task.CheckboxId))
        {
            var note = await context.Notes.FirstOrDefaultAsync(n => n.Id == task.NoteId, cancellationToken);
            if (note != null)
            {
                var isChecked = request.Status == "done";
                updatedNoteContent = CheckboxParser.UpdateCheckboxCheckedState(note.Content, task.CheckboxId, isChecked);
                note.Content = updatedNoteContent;
                note.UpdatedAt = DateTime.UtcNow;
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        return new UpdateTaskStatusResult
        {
            Task = new TaskDto
            {
                Id = task.Id,
                Title = task.Title,
                Status = task.Status,
                CreatedAt = task.CreatedAt,
                UpdatedAt = task.UpdatedAt,
                CompletedAt = task.CompletedAt,
                DueDate = task.DueDate,
                NoteId = task.NoteId,
                CheckboxId = task.CheckboxId,
                Labels = task.TaskLabels.Select(tl => new TaskLabelDto
                {
                    Id = tl.Label.Id,
                    Name = tl.Label.Name
                }).ToList()
            },
            NoteId = task.NoteId,
            UpdatedNoteContent = updatedNoteContent
        };
    }
}
