using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;
using MyNote.Application.Features.Notes;
using MyNote.Application.Features.Tasks;

namespace MyNote.Application.Features.Labels;

public record LabelDetailsDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public List<NoteDto> Notes { get; init; } = new();
    public List<TaskDto> Tasks { get; init; } = new();
}

public record GetLabelDetailsQuery : IRequest<LabelDetailsDto?>
{
    public Guid LabelId { get; init; }
}

public class GetLabelDetailsHandler(IApplicationDbContext context) : IRequestHandler<GetLabelDetailsQuery, LabelDetailsDto?>
{
    public async Task<LabelDetailsDto?> Handle(GetLabelDetailsQuery request, CancellationToken cancellationToken)
    {
        var label = await context.Labels
            .FirstOrDefaultAsync(l => l.Id == request.LabelId, cancellationToken);

        if (label is null)
            return null;

        // Get notes with this label (newest first)
        var notes = await context.Notes
            .Include(n => n.NoteLabels)
            .ThenInclude(nl => nl.Label)
            .Where(n => n.NoteLabels.Any(nl => nl.LabelId == request.LabelId))
            .OrderByDescending(n => n.CreatedAt)
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

        // Get tasks with this label (grouped by status, sorted by due date)
        var tasks = await context.Tasks
            .Include(t => t.TaskLabels)
            .ThenInclude(tl => tl.Label)
            .Where(t => t.TaskLabels.Any(tl => tl.LabelId == request.LabelId))
            .OrderBy(t => t.Status)
            .ThenBy(t => t.DueDate == null ? 1 : 0)
            .ThenBy(t => t.DueDate)
            .ThenByDescending(t => t.CreatedAt)
            .Select(t => new TaskDto
            {
                Id = t.Id,
                Title = t.Title,
                Status = t.Status,
                CreatedAt = t.CreatedAt,
                UpdatedAt = t.UpdatedAt,
                CompletedAt = t.CompletedAt,
                DueDate = t.DueDate,
                NoteId = t.NoteId,
                Labels = t.TaskLabels.Select(tl => new TaskLabelDto
                {
                    Id = tl.Label.Id,
                    Name = tl.Label.Name
                }).ToList()
            })
            .ToListAsync(cancellationToken);

        return new LabelDetailsDto
        {
            Id = label.Id,
            Name = label.Name,
            Notes = notes,
            Tasks = tasks
        };
    }
}
