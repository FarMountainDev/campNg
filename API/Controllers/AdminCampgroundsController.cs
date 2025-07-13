using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize(Roles = "Admin,Moderator")]
[Route("api/admin/campgrounds")]
public class AdminCampgroundsController(CampContext context) : BaseApiController
{
    
}