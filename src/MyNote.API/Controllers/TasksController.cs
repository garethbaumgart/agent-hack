using MediatR;
using Microsoft.AspNetCore.Mvc;
using MyNote.Application.Features.Tasks;

namespace MyNote.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TasksController(IMediator mediator) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<TaskDto>>> GetAll(CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetTasksQuery(), cancellationToken);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> Create([FromBody] CreateTaskCommand command, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(command, cancellationToken);
        return CreatedAtAction(nameof(GetAll), new { id = result.Id }, result);
    }
}
