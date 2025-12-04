using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Tasks;

public record DeleteTaskCommand : IRequest<bool>
{
    public Guid Id { get; init; }
}

public class DeleteTaskHandler(IApplicationDbContext context) : IRequestHandler<DeleteTaskCommand, bool>
{
    public async Task<bool> Handle(DeleteTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await context.Tasks.FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);
        if (task == null) return false;

        context.Tasks.Remove(task);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
