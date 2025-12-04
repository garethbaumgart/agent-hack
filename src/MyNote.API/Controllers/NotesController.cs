using MediatR;
using Microsoft.AspNetCore.Mvc;
using MyNote.Application.Features.Notes;

namespace MyNote.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotesController(IMediator mediator) : ControllerBase
{
    [HttpPost]
    public async Task<ActionResult<NoteDto>> Create([FromBody] CreateNoteCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(Create), new { id = result.Id }, result);
    }
}
