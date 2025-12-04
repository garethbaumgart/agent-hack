using Microsoft.EntityFrameworkCore;
using MyNote.Domain.Entities;

namespace MyNote.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Note> Notes { get; }
    DbSet<TaskItem> Tasks { get; }
    DbSet<Label> Labels { get; }
    DbSet<NoteLabel> NoteLabels { get; }
    DbSet<TaskLabel> TaskLabels { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
