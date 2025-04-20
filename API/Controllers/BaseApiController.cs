using Core.Entities;
using Core.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BaseApiController : ControllerBase
{
    /// <summary>
    /// Creates a <see cref="PagedResult{T}" /> from a queryable source and returns it as an <see cref="OkObjectResult" />.
    /// </summary>
    /// <returns>An <see cref="OkObjectResult" /> of type <see cref="PagedResult{T}" /></returns>
    protected async Task<IActionResult> CreatePagedResult<T>(IQueryable<T> query, int pageNumber, int pageSize)
        where T : BaseEntity
    {
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        var count = await query.CountAsync();
        
        var pagination = new PagedResult<T>(pageNumber, pageSize, count, items);
        
        return Ok(pagination);
    }
    
    /// <summary>
    /// Creates and returns a <see cref="PagedResult{T}" /> from a queryable source.
    /// </summary>
    /// <returns>A <see cref="PagedResult{T}" /> of type <typeparamref name="T" /></returns>
    protected static async Task<PagedResult<T>> GetPagedData<T>(IQueryable<T> query, int pageNumber, int pageSize)
        where T : BaseEntity
    {
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync();
        var count = await query.CountAsync();
        
        return new PagedResult<T>(pageNumber, pageSize, count, items);
    }
}