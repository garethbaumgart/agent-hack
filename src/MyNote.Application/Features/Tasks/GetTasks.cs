using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Tasks;

public record GetTasksQuery : IRequest<List<TaskDto>>;

public class GetTasksHandler(IApplicationDbContext context) : IRequestHandler<GetTasksQuery, List<TaskDto>>
{
    public async Task<List<TaskDto>> Handle(GetTasksQuery request, CancellationToken cancellationToken)
    {
        return await context.Tasks
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CompletedAt = t.CompletedAt,
                DueDate = t.DueDate,
                NoteId = t.NoteId
            })
            .ToListAsync(cancellationToken);
    }
}
