using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class ReservationsController(CampContext context) : BaseApiController
{
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetReservation(int id)
    {
        var reservation = await context.Reservations
            .Include(e => e.Campsite)
            .FirstOrDefaultAsync(e => e.Id == id);
        
        if (reservation is null)
            return NotFound();
        
        return Ok(reservation);
    }
}