using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;

namespace MyNote.Application.Features.Labels;

public record RemoveLabelFromTaskCommand : IRequest<bool>
{
    public Guid TaskId { get; init; }
    public Guid LabelId { get; init; }
}

public class RemoveLabelFromTaskHandler(IApplicationDbContext context) : IRequestHandler<RemoveLabelFromTaskCommand, bool>
{
    public async Task<bool> Handle(RemoveLabelFromTaskCommand request, CancellationToken cancellationToken)
    {
        var taskLabel = await context.TaskLabels
            .FirstOrDefaultAsync(tl => tl.TaskId == request.TaskId && tl.LabelId == request.LabelId, cancellationToken);

        if (taskLabel is null)
            return false;

        context.TaskLabels.Remove(taskLabel);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }
}
