using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Labels;

public record LabelDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
}

public record GetLabelsQuery : IRequest<List<LabelDto>>;

public class GetLabelsHandler(IApplicationDbContext context) : IRequestHandler<GetLabelsQuery, List<LabelDto>>
{
    public async Task<List<LabelDto>> Handle(GetLabelsQuery request, CancellationToken cancellationToken)
    {
        return await context.Labels
            .OrderBy(l => l.Name)
            .Select(l => new LabelDto
            {
                Id = l.Id,
                Name = l.Name,
                CreatedAt = l.CreatedAt
            })
            .ToListAsync(cancellationToken);
    }
}
