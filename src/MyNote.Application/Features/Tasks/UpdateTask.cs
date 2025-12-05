using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;
using MyNote.Application.Common.Services;

namespace MyNote.Application.Features.Tasks;

public record UpdateTaskCommand : IRequest<UpdateTaskTitleResult?>
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
}

public record UpdateTaskTitleResult
{
    public TaskDto Task { get; init; } = null!;
    public Guid? NoteId { get; init; }
    public string? UpdatedNoteContent { get; init; }
}

public class UpdateTaskHandler(IApplicationDbContext context) : IRequestHandler<UpdateTaskCommand, UpdateTaskTitleResult?>
{
    public async Task<UpdateTaskTitleResult?> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await context.Tasks
            .Include(t => t.TaskLabels)
            .ThenInclude(tl => tl.Label)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (task == null) return null;

        task.Title = request.Title;
        task.UpdatedAt = DateTime.UtcNow;

        string? updatedNoteContent = null;

        // US-26: If task is linked to a note, update the checkbox text
        if (task.NoteId.HasValue && !string.IsNullOrEmpty(task.CheckboxId))
        {
            var note = await context.Notes.FirstOrDefaultAsync(n => n.Id == task.NoteId, cancellationToken);
            if (note != null)
            {
                updatedNoteContent = CheckboxParser.UpdateCheckboxText(note.Content, task.CheckboxId, request.Title);
                note.Content = updatedNoteContent;
                note.UpdatedAt = DateTime.UtcNow;
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        return new UpdateTaskTitleResult
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
