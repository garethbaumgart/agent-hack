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
            .Include(t => t.TaskLabels)
            .ThenInclude(tl => tl.Label)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                StartedAt = t.StartedAt,
                CompletedAt = t.CompletedAt,
                DueDate = t.DueDate,
                NoteId = t.NoteId,
                CheckboxId = t.CheckboxId,
                Labels = t.TaskLabels.Select(tl => new TaskLabelDto
                {
                    Id = tl.Label.Id,
                    Name = tl.Label.Name
                }).ToList()
            })
            .ToListAsync(cancellationToken);
    }
}
