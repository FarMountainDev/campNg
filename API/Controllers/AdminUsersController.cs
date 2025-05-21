using API.DTOs;
using Core.Models;
using Core.Parameters;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController(CampContext context) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AppUserDto>>> GetUsers([FromQuery] BaseParams baseParams)
    {
        var query = context.Users.AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(baseParams.Search))
            query = query.Where(e => 
                (!string.IsNullOrWhiteSpace(e.UserName) && e.UserName.Contains(baseParams.Search))
                    || (!string.IsNullOrWhiteSpace(e.Email) && e.Email.Contains(baseParams.Search))
                    || (!string.IsNullOrWhiteSpace(e.FirstName) && e.FirstName.Contains(baseParams.Search))
                    || (!string.IsNullOrWhiteSpace(e.LastName) && e.LastName.Contains(baseParams.Search)));
        
        if (!string.IsNullOrWhiteSpace(baseParams.Sort))
        {
            var sortField = baseParams.Sort.ToLower();
            var isDescending = baseParams.SortDirection?.ToLower() == "desc";
    
            query = sortField switch
            {
                "id" => isDescending ? query.OrderByDescending(u => u.Id) : query.OrderBy(u => u.Id),
                "username" => isDescending ? query.OrderByDescending(u => u.UserName) : query.OrderBy(u => u.UserName),
                "email" => isDescending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
                "firstname" => isDescending ? query.OrderByDescending(u => u.FirstName) : query.OrderBy(u => u.FirstName),
                "lastname" => isDescending ? query.OrderByDescending(u => u.LastName) : query.OrderBy(u => u.LastName),
                "createdat" => isDescending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
                _ => isDescending ? query.OrderByDescending(u => u.UserName) : query.OrderBy(u => u.UserName)
            };
        }
        else
        {
            query = query.OrderBy(e => e.Id);
        }
        
        // Cannot use CreatePagedResult because IdentityUser does not implement BaseEntity or IDtoConvertible
        var items = await query.Skip((baseParams.PageNumber - 1) * baseParams.PageSize).Take(baseParams.PageSize).ToListAsync();
        var count = await query.CountAsync();
        
        var dtoItems = items.Select(user => new AppUserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CreatedAt = user.CreatedAt,
            IsEmailConfirmed = user.EmailConfirmed,
        }).ToList();
        
        var pagination = new PagedResult<AppUserDto>(baseParams.PageNumber, baseParams.PageSize, count, dtoItems);
        
        return Ok(pagination);
    }
}