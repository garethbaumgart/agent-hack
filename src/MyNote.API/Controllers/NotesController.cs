using MediatR;
using Microsoft.AspNetCore.Mvc;
using MyNote.Application.Features.Notes;

namespace MyNote.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<NoteDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetNotesQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<NoteDto>> Get(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetNoteQuery(id), cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<NoteDto>> Create([FromBody] CreateNoteCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(Get), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<NoteDto>> Update(Guid id, [FromBody] UpdateNoteCommand command, CancellationToken cancellationToken)
    {
        if (id != command.Id)
            return BadRequest();

        var result = await mediator.Send(command, cancellationToken);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteNoteCommand(id), cancellationToken);
        return result ? NoContent() : NotFound();
    }
}
