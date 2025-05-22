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
    public IActionResult GetValidationError(CreateOrderDto reservation)
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

    [Authorize(Roles = "Admin")]
    [HttpGet("admin-secret")]
    public IActionResult GetAdminSecret()
    {
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isAdmin = User.IsInRole("Admin");
        var roles = User.FindFirstValue(ClaimTypes.Role);
        
        return Ok(new
        {
            name, id, isAdmin, roles
        });
    }

    [Authorize(Roles = "Moderator")]
    [HttpGet("mod-secret")]
    public IActionResult GetModeratorSecret()
    {
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        var id = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var isModerator = User.IsInRole("Moderator");
        var roles = User.FindFirstValue(ClaimTypes.Role);
        
        return Ok(new
        {
            name, id, isModerator, roles
        });
    }
}