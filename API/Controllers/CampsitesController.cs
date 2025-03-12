using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class CampsitesController(IGenericRepository<Campsite> repo) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult> GetCampsites([FromQuery]BaseSpecParams specParams)
    {
        var spec = new CampsiteSpecification(specParams);
        
        return await CreatePagedResult(repo, spec, specParams.PageNumber, specParams.PageSize);
    }
    
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Campsite>> GetCampsite(int id)
    {
        var campsite = await repo.GetByIdAsync(id);
        
        if (campsite == null) return NotFound();
        
        return campsite;
    }
    
    [HttpPost]
    public async Task<ActionResult<Campsite>> CreateCampsite(Campsite campsite)
    {
        repo.Add(campsite);
        
        if (await repo.SaveAllAsync())
        {
            return CreatedAtAction(nameof(GetCampsite), new { id = campsite.Id }, campsite);
        }

        return BadRequest("Problem creating campsite");
    }
    
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateCampsite(int id, Campsite campsite)
    {
        if (id != campsite.Id || !CampsiteExists(id)) return BadRequest("Cannot update this campsite");
        
        repo.Update(campsite);
        
        if (await repo.SaveAllAsync())
        {
            return NoContent();
        }
        
        return BadRequest("Problem updating campsite");
    }
    
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteCampsite(int id)
    {
        var campsite = await repo.GetByIdAsync(id);
        
        if (campsite == null) return NotFound();
        
        repo.Remove(campsite);
        
        if (await repo.SaveAllAsync())
        {
            return NoContent();
        }
        
        return BadRequest("Problem deleting campsite");
    }
    
    private bool CampsiteExists(int id) => repo.Exists(id);
}