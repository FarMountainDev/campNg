using Core.Entities;
using Core.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    protected async Task<IActionResult> CreatePagedResult<T>(IQueryable<T> query, int pageNumber, int pageSize)
        where T : BaseEntity
    {
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        var count = await query.CountAsync();
        
        var pagination = new PagedResult<T>(pageNumber, pageSize, count, items);
        
        return Ok(pagination);
    }
}