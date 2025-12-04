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

    [HttpPut("{id:guid}/status")]
    public async Task<ActionResult<TaskDto>> UpdateStatus(Guid id, [FromBody] UpdateTaskStatusRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpdateTaskStatusCommand { Id = id, Status = request.Status }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TaskDto>> Update(Guid id, [FromBody] UpdateTaskRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpdateTaskCommand { Id = id, Title = request.Title }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpPut("{id:guid}/due-date")]
    public async Task<ActionResult<TaskDto>> UpdateDueDate(Guid id, [FromBody] UpdateTaskDueDateRequest request, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpdateTaskDueDateCommand { Id = id, DueDate = request.DueDate }, cancellationToken);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new DeleteTaskCommand { Id = id }, cancellationToken);
        if (!result) return NotFound();
        return NoContent();
    }
}

public record UpdateTaskStatusRequest
{
    public string Status { get; init; } = string.Empty;
}

public record UpdateTaskRequest
{
    public string Title { get; init; } = string.Empty;
}

public record UpdateTaskDueDateRequest
{
    public DateTime? DueDate { get; init; }
}
