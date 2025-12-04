namespace MyNote.Domain.Entities;

public class Label
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public ICollection<NoteLabel> NoteLabels { get; set; } = new List<NoteLabel>();
    public ICollection<TaskLabel> TaskLabels { get; set; } = new List<TaskLabel>();
}
