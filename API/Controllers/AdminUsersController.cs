using API.DTOs;
using API.Extensions;
using Core.Entities;
using Core.Models;
using Core.Parameters;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin,Moderator")]
[Route("api/admin/users")]
public class AdminUsersController(CampContext context, UserManager<AppUser> userManager) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<AppUserDto>>> GetUsers([FromQuery] UserParams userParams)
    {
        var query = context.Users.AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(userParams.Status))
        {
            var status = userParams.Status.ToLower();
            query = status switch
            {
                "locked" => query.Where(u => u.LockoutEnd != null && u.LockoutEnd > DateTimeOffset.UtcNow),
                "active" => query.Where(u => u.LockoutEnd == null || u.LockoutEnd <= DateTimeOffset.UtcNow),
                _ => query
            };
        }
        
        if (!string.IsNullOrWhiteSpace(userParams.Role))
        {
            var role = userParams.Role.Trim();
            var userIds = await context.UserRoles
                .Join(context.Roles,
                    userRole => userRole.RoleId,
                    identityRole => identityRole.Id,
                    (userRole, r) => new { userRole.UserId, r.Name })
                .Where(x => x.Name.ToLower() == role.ToLower())
                .Select(x => x.UserId)
                .ToListAsync();
    
            query = query.Where(u => userIds.Contains(u.Id));
        }
        
        if (!string.IsNullOrWhiteSpace(userParams.Search))
            query = query.Where(e => 
                (!string.IsNullOrWhiteSpace(e.UserName) && e.UserName.Contains(userParams.Search))
                    || (!string.IsNullOrWhiteSpace(e.Email) && e.Email.Contains(userParams.Search))
                    || (!string.IsNullOrWhiteSpace(e.FirstName) && e.FirstName.Contains(userParams.Search))
                    || (!string.IsNullOrWhiteSpace(e.LastName) && e.LastName.Contains(userParams.Search)));
        
        if (!string.IsNullOrWhiteSpace(userParams.Sort))
        {
            var sortField = userParams.Sort.ToLower();
            var isDescending = userParams.SortDirection?.ToLower() == "desc";
    
            query = sortField switch
            {
                "id" => isDescending ? query.OrderByDescending(u => u.Id) : query.OrderBy(u => u.Id),
                "username" => isDescending ? query.OrderByDescending(u => u.UserName) : query.OrderBy(u => u.UserName),
                "email" => isDescending ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email),
                "firstname" => isDescending ? query.OrderByDescending(u => u.FirstName) : query.OrderBy(u => u.FirstName),
                "lastname" => isDescending ? query.OrderByDescending(u => u.LastName) : query.OrderBy(u => u.LastName),
                "createdat" => isDescending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt),
                _ => isDescending ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt)
            };
        }
        else query = query.OrderByDescending(e => e.CreatedAt);
        
        // Cannot use CreatePagedResult because IdentityUser does not implement BaseEntity or IDtoConvertible
        var items = await query.Skip((userParams.PageNumber - 1) * userParams.PageSize).Take(userParams.PageSize).ToListAsync();
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
            IsLockedOut = user.LockoutEnd != null && user.LockoutEnd > DateTimeOffset.UtcNow,
            Roles = userManager.GetRolesAsync(user).Result.ToList()
        }).ToList();
        
        var pagination = new PagedResult<AppUserDto>(userParams.PageNumber, userParams.PageSize, count, dtoItems);
        
        return Ok(pagination);
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPut("update/")]
    public async Task<ActionResult<AppUserDto>> UpdateUser(AppUserDto userDto)
    {
        var user = await context.Users.FindAsync(userDto.Id);
        
        if (user == null) return NotFound();
        
        if (User.GetEmail() == user.Email)
            return BadRequest("You cannot update your own account from here");
        
        user.UserName = userDto.UserName;
        user.Email = userDto.Email;
        user.FirstName = userDto.FirstName;
        user.LastName = userDto.LastName;
        
        context.Users.Update(user);
        var result = await context.SaveChangesAsync();
        if (result <= 0) return BadRequest("Failed to update user");
        
        return Ok(userDto);
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPost("lock/{id}")]
    public async Task<ActionResult<AppUserDto>> LockUser(string id)
    {
        var user = await context.Users.FindAsync(id);
        
        if (user == null) return NotFound();
        
        if (User.GetEmail() == user.Email)
            return BadRequest("You cannot lock your own account");

        var result = await userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue);
        
        if (!result.Succeeded) return BadRequest("Failed to lock user");
        
        var userDto = new AppUserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CreatedAt = user.CreatedAt,
            IsEmailConfirmed = user.EmailConfirmed,
            IsLockedOut = true,
            Roles = userManager.GetRolesAsync(user).Result.ToList()
        };
        
        return Ok(userDto);
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPost("unlock/{id}")]
    public async Task<ActionResult<AppUserDto>> UnlockUser(string id)
    {
        var user = await context.Users.FindAsync(id);
        
        if (user == null) return NotFound();
        
        if (User.GetEmail() == user.Email)
            return BadRequest("You cannot unlock your own account");

        var result = await userManager.SetLockoutEndDateAsync(user, null);
        
        if (!result.Succeeded) return BadRequest("Failed to unlock user");
        
        var userDto = new AppUserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CreatedAt = user.CreatedAt,
            IsEmailConfirmed = user.EmailConfirmed,
            IsLockedOut = false,
            Roles = userManager.GetRolesAsync(user).Result.ToList()
        };
        
        return Ok(userDto);
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPost("add-mod/{id}")]
    public async Task<ActionResult<AppUserDto>> AddModerator(string id)
    {
        var user = await context.Users.FindAsync(id);
        
        if (user == null) return NotFound();
        
        if (User.GetEmail() == user.Email)
            return BadRequest("You cannot add yourself as a moderator");

        var result = await userManager.AddToRoleAsync(user, "Moderator");
        
        if (!result.Succeeded) return BadRequest("Failed to add moderator role");
        
        var userDto = new AppUserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CreatedAt = user.CreatedAt,
            IsEmailConfirmed = user.EmailConfirmed,
            IsLockedOut = user.LockoutEnd != null && user.LockoutEnd > DateTimeOffset.UtcNow,
            Roles = userManager.GetRolesAsync(user).Result.ToList()
        };
        
        return Ok(userDto);
    }
    
    [Authorize(Roles = "Admin")]
    [HttpPost("remove-mod/{id}")]
    public async Task<ActionResult<AppUserDto>> RemoveModerator(string id)
    {
        var user = await context.Users.FindAsync(id);
        
        if (user == null) return NotFound();
        
        if (User.GetEmail() == user.Email)
            return BadRequest("You cannot remove yourself as a moderator");

        var result = await userManager.RemoveFromRoleAsync(user, "Moderator");
        
        if (!result.Succeeded) return BadRequest("Failed to remove moderator role");
        
        var userDto = new AppUserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            CreatedAt = user.CreatedAt,
            IsEmailConfirmed = user.EmailConfirmed,
            IsLockedOut = user.LockoutEnd != null && user.LockoutEnd > DateTimeOffset.UtcNow,
            Roles = userManager.GetRolesAsync(user).Result.ToList()
        };
        
        return Ok(userDto);
    }
}