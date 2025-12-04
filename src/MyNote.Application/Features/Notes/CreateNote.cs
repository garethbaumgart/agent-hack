using MediatR;
using MyNote.Application.Common.Interfaces;
using MyNote.Domain.Entities;

namespace MyNote.Application.Features.Notes;

public record CreateNoteCommand : IRequest<NoteDto>
{
    public string Content { get; init; } = string.Empty;
}

public record NoteDto
{
    public Guid Id { get; init; }
    public string Content { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
}

public class CreateNoteHandler(IApplicationDbContext context) : IRequestHandler<CreateNoteCommand, NoteDto>
{
    public async Task<NoteDto> Handle(CreateNoteCommand request, CancellationToken cancellationToken)
    {
        var note = new Note
        {
            Id = Guid.NewGuid(),
            Content = request.Content,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Notes.Add(note);
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
