using Core.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampgroundsController(CampContext context) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Campground>>> GetCampgrounds()
    {
        return await context.Campgrounds.ToListAsync();
    }
    
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Campground>> GetCampground(int id)
    {
        var campground = await context.Campgrounds.FindAsync(id);
        
        if (campground == null) return NotFound();
        
        return campground;
    }
    
    [HttpPost]
    public async Task<ActionResult<Campground>> CreateCampground(Campground campground)
    {
        context.Campgrounds.Add(campground);
        
        await context.SaveChangesAsync();

        return campground;
    }
    
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateCampground(int id, Campground campground)
    {
        if (id != campground.Id || !CampgroundExists(id)) return BadRequest("Cannot update this campground");
        
        context.Entry(campground).State = EntityState.Modified;
        
        await context.SaveChangesAsync();
        
        return NoContent();
    }
    
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteCampground(int id)
    {
        var campground = await context.Campgrounds.FindAsync(id);
        
        if (campground == null) return NotFound();
        
        context.Campgrounds.Remove(campground);
        
        await context.SaveChangesAsync();
        
        return NoContent();
    }
    
    private bool CampgroundExists(int id) => context.Campgrounds.Any(x => x.Id == id);
}