using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Notes;

public record GetNotesQuery : IRequest<List<NoteDto>>;

public class GetNotesHandler(IApplicationDbContext context) : IRequestHandler<GetNotesQuery, List<NoteDto>>
{
    public async Task<List<NoteDto>> Handle(GetNotesQuery request, CancellationToken cancellationToken)
    {
        return await context.Notes
            .Include(n => n.NoteLabels)
            .ThenInclude(nl => nl.Label)
            .OrderByDescending(n => n.UpdatedAt)
            .Select(n => new NoteDto
            {
                Id = n.Id,
                Content = n.Content,
                CreatedAt = n.CreatedAt,
                UpdatedAt = n.UpdatedAt,
                Labels = n.NoteLabels.Select(nl => new NoteLabelDto
                {
                    Id = nl.Label.Id,
                    Name = nl.Label.Name
                }).ToList()
            })
            .ToListAsync(cancellationToken);
    }
}
