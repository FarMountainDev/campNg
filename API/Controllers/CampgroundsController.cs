using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CampgroundsController(IGenericRepository<Campground> repo) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Campground>>> GetCampgrounds()
    {
        var spec = new CampgroundSpecification();
        
        var campgrounds = await repo.ListAsync(spec);
        
        return Ok(campgrounds);
    }
    
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Campground>> GetCampground(int id)
    {
        var campground = await repo.GetByIdAsync(id);
        
        if (campground == null) return NotFound();
        
        return campground;
    }
    
    [HttpPost]
    public async Task<ActionResult<Campground>> CreateCampground(Campground campground)
    {
        repo.Add(campground);
        
        if (await repo.SaveAllAsync())
        {
            return CreatedAtAction(nameof(GetCampground), new { id = campground.Id }, campground);
        }

        return BadRequest("Problem creating campground");
    }
    
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateCampground(int id, Campground campground)
    {
        if (id != campground.Id || !CampgroundExists(id)) return BadRequest("Cannot update this campground");
        
        repo.Update(campground);
        
        if (await repo.SaveAllAsync())
        {
            return NoContent();
        }
        
        return BadRequest("Problem updating campground");
    }
    
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteCampground(int id)
    {
        var campground = await repo.GetByIdAsync(id);
        
        if (campground == null) return NotFound();
        
        repo.Remove(campground);
        
        if (await repo.SaveAllAsync())
        {
            return NoContent();
        }
        
        return BadRequest("Problem updating campground");
    }
    
    private bool CampgroundExists(int id) => repo.Exists(id);
}