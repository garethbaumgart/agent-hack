using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Notes;

public record GetNoteQuery(Guid Id) : IRequest<NoteDto?>;

public class GetNoteHandler(IApplicationDbContext context) : IRequestHandler<GetNoteQuery, NoteDto?>
{
    public async Task<NoteDto?> Handle(GetNoteQuery request, CancellationToken cancellationToken)
    {
        var note = await context.Notes
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note is null)
            return null;

        return new NoteDto
        {
            Id = note.Id,
            Content = note.Content,
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt
        };
    }
}
