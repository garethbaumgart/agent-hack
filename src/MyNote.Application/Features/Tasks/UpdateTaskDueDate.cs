using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Tasks;

public record UpdateTaskDueDateCommand : IRequest<TaskDto?>
{
    public Guid Id { get; init; }
    public DateTime? DueDate { get; init; }
}

public class UpdateTaskDueDateHandler(IApplicationDbContext context) : IRequestHandler<UpdateTaskDueDateCommand, TaskDto?>
{
    public async Task<TaskDto?> Handle(UpdateTaskDueDateCommand request, CancellationToken cancellationToken)
    {
        var task = await context.Tasks.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (task == null) return null;

        task.DueDate = request.DueDate;
        task.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Status = task.Status,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            CompletedAt = task.CompletedAt,
            DueDate = task.DueDate,
            NoteId = task.NoteId
        };
    }
}
