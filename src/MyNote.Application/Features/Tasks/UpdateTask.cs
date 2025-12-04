using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Tasks;

public record UpdateTaskCommand : IRequest<TaskDto?>
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
}

public class UpdateTaskHandler(IApplicationDbContext context) : IRequestHandler<UpdateTaskCommand, TaskDto?>
{
    public async Task<TaskDto?> Handle(UpdateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await context.Tasks.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (task == null) return null;

        task.Title = request.Title;
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
