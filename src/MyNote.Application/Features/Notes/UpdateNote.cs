using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Notes;

public record UpdateNoteCommand : IRequest<NoteDto?>
{
    public Guid Id { get; init; }
    public string Content { get; init; } = string.Empty;
}

public class UpdateNoteHandler(IApplicationDbContext context) : IRequestHandler<UpdateNoteCommand, NoteDto?>
{
    public async Task<NoteDto?> Handle(UpdateNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await context.Notes
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note is null)
            return null;

        note.Content = request.Content;
        note.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        return new NoteDto
        {
            Id = note.Id,
            Content = note.Content,
            CreatedAt = note.CreatedAt,
            UpdatedAt = note.UpdatedAt
        };
    }
}
