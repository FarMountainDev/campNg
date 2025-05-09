using API.Extensions;
using Core.Entities;
using Core.Interfaces;
using Core.Parameters;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class ReservationsController(CampContext context, IReservationService reservationService, IConfiguration config) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<List<Reservation>>> GetAllReservations()
    {
        var reservations = await context.Reservations
            .ToListAsync();
        
        return Ok(reservations.Select(r => r.ToDto()).ToList());
    }
    
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetReservation(int id)
    {
        var reservation = await context.Reservations
            .Include(e => e.Campsite)
            .FirstOrDefaultAsync(e => e.Id == id);
        
        if (reservation is null)
            return NotFound();
        
        return Ok(reservation.ToDto());
    }

    [HttpGet("valid")]
    public async Task<ActionResult<bool>> ValidReservation([FromQuery] CampParams campParams)
    {
        if (campParams.CampsiteId is null)
            return BadRequest("CampsiteId is required");

        if (campParams.StartDate is null)
            return BadRequest("StartDate is required");

        if (campParams.EndDate is null)
            return BadRequest("EndDate is required");

        var startDate = (DateOnly)campParams.StartDate;
        var endDate = (DateOnly)campParams.EndDate;

        var validationResult = await reservationService.ValidReservation(
            (int)campParams.CampsiteId, startDate, endDate);
    
        if (!validationResult.IsValid)
            return BadRequest(validationResult.ErrorMessage);
    
        return true;
    }
}