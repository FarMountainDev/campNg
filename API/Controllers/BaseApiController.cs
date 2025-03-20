using API.RequestHelpers;
using Core.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    protected async Task<IActionResult> CreatePagedResult<T>(DbContext context, IQueryable<T> query,
        int pageIndex, int pageSize) where T : BaseEntity
    {
        var items = await query.ToListAsync();
        var count = await query.CountAsync();
        
        var pagination = new Pagination<T>(pageIndex, pageSize, count, items);
        
        return Ok(pagination);
    }
}