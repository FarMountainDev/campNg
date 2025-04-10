using System.Security.Authentication;
using System.Security.Claims;
using Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static string GetEmail(this ClaimsPrincipal user)
    {
        var email = user.FindFirstValue(ClaimTypes.Email);
        
        if (string.IsNullOrEmpty(email))
            throw new AuthenticationException("Email claim not found");

        return email;
    }
    
    public static async Task<AppUser> GetUserByEmail(this UserManager<AppUser> userManager, ClaimsPrincipal user)
    {
        var appUser = await userManager.Users.FirstOrDefaultAsync(x => x.Email == user.GetEmail());
        
        if (appUser == null)
            throw new AuthenticationException("User not found");
        
        return appUser;
    }
}