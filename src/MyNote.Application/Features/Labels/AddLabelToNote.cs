using MediatR;
using Microsoft.EntityFrameworkCore;
using MyNote.Application.Common.Interfaces;
using MyNote.Domain.Entities;

namespace MyNote.Application.Features.Labels;

public record AddLabelToNoteCommand : IRequest<LabelDto?>
{
    public Guid NoteId { get; init; }
    public string LabelName { get; init; } = string.Empty;
}

public class AddLabelToNoteHandler(IApplicationDbContext context) : IRequestHandler<AddLabelToNoteCommand, LabelDto?>
{
    public async Task<LabelDto?> Handle(AddLabelToNoteCommand request, CancellationToken cancellationToken)
    {
        var note = await context.Notes.FirstOrDefaultAsync(n => n.Id == request.NoteId, cancellationToken);
        if (note == null) return null;

        var labelName = request.LabelName.Trim();

        // Find existing label or create new one
        var label = await context.Labels.FirstOrDefaultAsync(l => l.Name == labelName, cancellationToken);
        if (label == null)
        {
            label = new Label
            {
                Id = Guid.NewGuid(),
                Name = labelName,
                CreatedAt = DateTime.UtcNow
            };
            context.Labels.Add(label);
        }

        // Check if note already has this label
        var existingNoteLabel = await context.NoteLabels
            .FirstOrDefaultAsync(nl => nl.NoteId == request.NoteId && nl.LabelId == label.Id, cancellationToken);

        if (existingNoteLabel == null)
        {
            var noteLabel = new NoteLabel
            {
                NoteId = request.NoteId,
                LabelId = label.Id
            };
            context.NoteLabels.Add(noteLabel);
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
