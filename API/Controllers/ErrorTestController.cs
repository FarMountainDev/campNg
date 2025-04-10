using System.Security.Claims;
using API.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class ErrorTestController : BaseApiController
{
    [HttpGet("unauthorized")]
    public ActionResult GetUnauthorized()
    {
        return Unauthorized();
    }
    
    [HttpGet("badrequest")]
    public ActionResult GetBadRequest()
    {
        return BadRequest("This was a bad request");
    }
    
    [HttpGet("notfound")]
    public ActionResult GetNotFound()
    {
        return NotFound();
    }
    
    [HttpGet("internalerror")]
    public ActionResult GetServerError()
    {
        throw new Exception("Test exception"); 
    }

    [HttpPost("validationerror")]
    public IActionResult GetValidationError(CreateReservationDto reservation)
    {
        return Ok();
    }

    [Authorize]
    [HttpGet("secret")]
    public IActionResult GetSecret()
    {
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        return Ok("Hello " + name + " your id is " + id);
    }
}