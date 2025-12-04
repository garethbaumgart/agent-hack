using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;
using MyNote.Domain.Entities;

namespace MyNote.Application.Features.Labels;

public record AddLabelToTaskCommand : IRequest<LabelDto?>
{
    public Guid TaskId { get; init; }
    public string LabelName { get; init; } = string.Empty;
}

public class AddLabelToTaskHandler(IApplicationDbContext context) : IRequestHandler<AddLabelToTaskCommand, LabelDto?>
{
    public async Task<LabelDto?> Handle(AddLabelToTaskCommand request, CancellationToken cancellationToken)
    {
        var task = await context.Tasks
            .Include(t => t.TaskLabels)
            .FirstOrDefaultAsync(t => t.Id == request.TaskId, cancellationToken);

        if (task is null)
            return null;

        var normalizedName = request.LabelName.Trim().ToLowerInvariant();

        var label = await context.Labels
            .FirstOrDefaultAsync(l => l.Name.ToLower() == normalizedName, cancellationToken);

        if (label is null)
        {
            label = new Label
            {
                Id = Guid.NewGuid(),
                Name = request.LabelName.Trim(),
                CreatedAt = DateTime.UtcNow
            };
            context.Labels.Add(label);
        }

        var existingLink = task.TaskLabels.FirstOrDefault(tl => tl.LabelId == label.Id);
        if (existingLink is null)
        {
            var taskLabel = new TaskLabel
            {
                TaskId = task.Id,
                LabelId = label.Id
            };
            context.TaskLabels.Add(taskLabel);
        }

        await context.SaveChangesAsync(cancellationToken);

        return new LabelDto
        {
            Id = label.Id,
            Name = label.Name,
            CreatedAt = label.CreatedAt
        };
    }
}
