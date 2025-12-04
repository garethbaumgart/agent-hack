using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Labels;

public record GetNoteLabelsQuery : IRequest<List<LabelDto>>
{
    public Guid NoteId { get; init; }
}

public class GetNoteLabelsHandler(IApplicationDbContext context) : IRequestHandler<GetNoteLabelsQuery, List<LabelDto>>
{
    public async Task<List<LabelDto>> Handle(GetNoteLabelsQuery request, CancellationToken cancellationToken)
    {
        return await context.NoteLabels
            .Where(nl => nl.NoteId == request.NoteId)
            .Select(nl => new LabelDto
            {
                Id = nl.Label.Id,
                Name = nl.Label.Name,
                CreatedAt = nl.Label.CreatedAt
            })
            .OrderBy(l => l.Name)
            .ToListAsync(cancellationToken);
    }
}
