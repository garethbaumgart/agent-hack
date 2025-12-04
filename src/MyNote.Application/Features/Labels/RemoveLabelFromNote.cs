using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Labels;

public record RemoveLabelFromNoteCommand : IRequest<bool>
{
    public Guid NoteId { get; init; }
    public Guid LabelId { get; init; }
}

public class RemoveLabelFromNoteHandler(IApplicationDbContext context) : IRequestHandler<RemoveLabelFromNoteCommand, bool>
{
    public async Task<bool> Handle(RemoveLabelFromNoteCommand request, CancellationToken cancellationToken)
    {
        var noteLabel = await context.NoteLabels
            .FirstOrDefaultAsync(nl => nl.NoteId == request.NoteId && nl.LabelId == request.LabelId, cancellationToken);

        if (noteLabel == null) return false;

        context.NoteLabels.Remove(noteLabel);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
