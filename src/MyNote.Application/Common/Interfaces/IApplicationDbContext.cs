using Microsoft.EntityFrameworkCore;
using MyNote.Domain.Entities;

namespace MyNote.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Note> Notes { get; }
    DbSet<TaskItem> Tasks { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}
