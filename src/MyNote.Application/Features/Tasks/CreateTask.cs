using MediatR;
using MyNote.Application.Common.Interfaces;
using MyNote.Domain.Entities;

namespace MyNote.Application.Features.Tasks;

public record CreateTaskCommand : IRequest<TaskDto>
{
    public string Title { get; init; } = string.Empty;
}

public record TaskDto
{
    public Guid Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Status { get; init; } = "todo";
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public Guid? NoteId { get; init; }
}

public class CreateTaskHandler(IApplicationDbContext context) : IRequestHandler<CreateTaskCommand, TaskDto>
{
    public async Task<TaskDto> Handle(CreateTaskCommand request, CancellationToken cancellationToken)
    {
        var task = new TaskItem
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            Status = "todo",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Tasks.Add(task);
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
