using Core.Entities;
using Core.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampgroundsController(ICampgroundsRepository repo) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Campground>>> GetCampgrounds()
    {
        return Ok(await repo.GetCampgroundsAsync());
    }
    
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Campground>> GetCampground(int id)
    {
        var campground = await repo.GetCampgroundByIdAsync(id);
        
        if (campground == null) return NotFound();
        
        return campground;
    }
    
    [HttpPost]
    public async Task<ActionResult<Campground>> CreateCampground(Campground campground)
    {
        repo.AddCampground(campground);
        
        if (await repo.SaveChangesAsync())
        {
            return CreatedAtAction(nameof(GetCampground), new { id = campground.Id }, campground);
        }

        return BadRequest("Problem creating campground");
    }
    
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateCampground(int id, Campground campground)
    {
        if (id != campground.Id || !CampgroundExists(id)) return BadRequest("Cannot update this campground");
        
        repo.UpdateCampground(campground);
        
        if (await repo.SaveChangesAsync())
        {
            return NoContent();
        }
        
        return BadRequest("Problem updating campground");
    }
    
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteCampground(int id)
    {
        var campground = await repo.GetCampgroundByIdAsync(id);
        
        if (campground == null) return NotFound();
        
        repo.DeleteCampground(campground);
        
        if (await repo.SaveChangesAsync())
        {
            return NoContent();
        }
        
        return BadRequest("Problem updating campground");
    }
    
    private bool CampgroundExists(int id) => repo.CampgroundExists(id);
}