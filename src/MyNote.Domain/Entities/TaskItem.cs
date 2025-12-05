namespace MyNote.Domain.Entities;

public class TaskItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Status { get; set; } = "todo"; // "todo", "in_progress", or "done"
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? DueDate { get; set; }
    public Guid? NoteId { get; set; }
    public Note? Note { get; set; }
    public string? CheckboxId { get; set; } // Unique ID linking to checkbox in note content
    public ICollection<TaskLabel> TaskLabels { get; set; } = new List<TaskLabel>();
}
