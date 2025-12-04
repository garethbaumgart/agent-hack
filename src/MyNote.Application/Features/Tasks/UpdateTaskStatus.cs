using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Tasks;

public record UpdateTaskStatusCommand : IRequest<TaskDto?>
{
    public Guid Id { get; init; }
    public string Status { get; init; } = string.Empty;
}

public class UpdateTaskStatusHandler(IApplicationDbContext context) : IRequestHandler<UpdateTaskStatusCommand, TaskDto?>
{
    public async Task<TaskDto?> Handle(UpdateTaskStatusCommand request, CancellationToken cancellationToken)
    {
        var task = await context.Tasks.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (task == null) return null;

        task.Status = request.Status;
        task.UpdatedAt = DateTime.UtcNow;
        task.CompletedAt = request.Status == "done" ? DateTime.UtcNow : null;

        await context.SaveChangesAsync(cancellationToken);

        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Status = task.Status,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            CompletedAt = task.CompletedAt,
            NoteId = task.NoteId
        };
    }
}
