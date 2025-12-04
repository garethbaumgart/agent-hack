using MediatR;
using Microsoft.AspNetCore.Mvc;
using MyNote.Application.Features.Labels;

namespace MyNote.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LabelsController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<LabelDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetLabelsQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("notes/{noteId:guid}")]
    public async Task<ActionResult<List<LabelDto>>> GetNoteLabels(Guid noteId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetNoteLabelsQuery { NoteId = noteId }, cancellationToken);
        return Ok(result);
    }

    [HttpPost("notes/{noteId:guid}")]
    public async Task<ActionResult<LabelDto>> AddLabelToNote(Guid noteId, [FromBody] AddLabelRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new AddLabelToNoteCommand { NoteId = noteId, LabelName = request.Name }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("notes/{noteId:guid}/{labelId:guid}")]
    public async Task<ActionResult> RemoveLabelFromNote(Guid noteId, Guid labelId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new RemoveLabelFromNoteCommand { NoteId = noteId, LabelId = labelId }, cancellationToken);
        if (!result) return NotFound();
        return NoContent();
    }

    [HttpPost("tasks/{taskId:guid}")]
    public async Task<ActionResult<LabelDto>> AddLabelToTask(Guid taskId, [FromBody] AddLabelRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new AddLabelToTaskCommand { TaskId = taskId, LabelName = request.Name }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("tasks/{taskId:guid}/{labelId:guid}")]
    public async Task<ActionResult> RemoveLabelFromTask(Guid taskId, Guid labelId, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new RemoveLabelFromTaskCommand { TaskId = taskId, LabelId = labelId }, cancellationToken);
        if (!result) return NotFound();
        return NoContent();
    }
}

public record AddLabelRequest
{
    public string Name { get; init; } = string.Empty;
}
