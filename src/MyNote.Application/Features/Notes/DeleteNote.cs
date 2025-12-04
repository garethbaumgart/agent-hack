using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Notes;

public record DeleteNoteCommand(Guid Id) : IRequest<bool>;

public class DeleteNoteHandler(IApplicationDbContext context) : IRequestHandler<DeleteNoteCommand, bool>
{
    public async Task<bool> Handle(DeleteNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await context.Notes
            .FirstOrDefaultAsync(n => n.Id == request.Id, cancellationToken);

        if (note is null)
            return false;

        context.Notes.Remove(note);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
