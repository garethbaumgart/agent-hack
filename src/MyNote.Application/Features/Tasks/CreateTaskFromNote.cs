using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;
using MyNote.Domain.Entities;

namespace MyNote.Application.Features.Tasks;

public record CreateTaskFromNoteCommand : IRequest<TaskDto?>
{
    public Guid NoteId { get; init; }
    public string Title { get; init; } = string.Empty;
}

public class CreateTaskFromNoteHandler(IApplicationDbContext context) : IRequestHandler<CreateTaskFromNoteCommand, TaskDto?>
{
    public async Task<TaskDto?> Handle(CreateTaskFromNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await context.Notes
            .Include(n => n.NoteLabels)
            .ThenInclude(nl => nl.Label)
            .FirstOrDefaultAsync(n => n.Id == request.NoteId, cancellationToken);

        if (note is null)
            return null;

        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Status = "todo",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            NoteId = note.Id
        };

        context.Tasks.Add(task);

        // Inherit labels from the note
        foreach (var noteLabel in note.NoteLabels)
        {
            var taskLabel = new TaskLabel
            {
                TaskId = task.Id,
                LabelId = noteLabel.LabelId
            };
            context.TaskLabels.Add(taskLabel);
        }

        await context.SaveChangesAsync(cancellationToken);

        return new TaskDto
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
            Labels = note.NoteLabels.Select(nl => new TaskLabelDto
            {
                Id = nl.Label.Id,
                Name = nl.Label.Name
            }).ToList()
        };
    }
}
