using API.DTOs;
using API.Extensions;
using Core.Parameters;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[Authorize(Roles = "Admin")]
[Route("api/admin/reservations")]
public class AdminReservationsController(CampContext context) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<ReservationDto>>> GetReservations([FromQuery] BaseParams baseParams)
    {
        var query = context.Reservations
            .Include(e => e.Campsite)
            .Include(e => e.OrderItem)
            .ThenInclude(x => x!.Order)
            .AsQueryable();
        
        if (!string.IsNullOrWhiteSpace(baseParams.Search))
            query = query.Where(e => 
                e.Campsite.Name.Contains(baseParams.Search) || e.Email.Contains(baseParams.Search));

        if (!string.IsNullOrWhiteSpace(baseParams.Sort))
        {
            var sortField = baseParams.Sort.ToLower();
            var isDescending = baseParams.SortDirection?.ToLower() == "desc";
            
            query = sortField switch
            {
                "id" => isDescending ? query.OrderByDescending(r => r.Id) : query.OrderBy(r => r.Id),
                "email" => isDescending ? query.OrderByDescending(r => r.Email) : query.OrderBy(r => r.Email),
                "campsiteid" => isDescending ? query.OrderByDescending(r => r.CampsiteId) : query.OrderBy(r => r.CampsiteId),
                "campsitename" => isDescending ? query.OrderByDescending(r => r.Campsite.Name) : query.OrderBy(r => r.Campsite.Name),
                "startdate" => isDescending ? query.OrderByDescending(r => r.StartDate) : query.OrderBy(r => r.StartDate),
                "enddate" => isDescending ? query.OrderByDescending(r => r.EndDate) : query.OrderBy(r => r.EndDate),
                _ => isDescending ? query.OrderByDescending(r => r.StartDate) : query.OrderBy(r => r.StartDate)
            };
        }
        else query = query.OrderByDescending(r => r.Id);
        
        return await CreatePagedResult(query, baseParams.PageNumber, baseParams.PageSize, r => r.ToDto(true));
    }
}