using Core.Entities;
using Core.Interfaces;
using Core.Specifications;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class CampsiteTypesController(IGenericRepository<CampsiteType> repo) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult> GetCampsiteTypes([FromQuery]BaseSpecParams specParams)
    {
        var spec = new CampsiteTypeSpecification(specParams);
        
        return await CreatePagedResult(repo, spec, specParams.PageSize, specParams.PageNumber);
    }
    
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CampsiteType>> GetCampsiteType(int id)
    {
        var campsiteType = await repo.GetByIdAsync(id);
        
        if (campsiteType == null) return NotFound();
        
        return campsiteType;
    }
    
    [HttpPost]
    public async Task<ActionResult<CampsiteType>> CreateCampsiteType(CampsiteType campsiteType)
    {
        repo.Add(campsiteType);
        
        if (await repo.SaveAllAsync())
        {
            return CreatedAtAction(nameof(GetCampsiteType), new { id = campsiteType.Id }, campsiteType);
        }

        return BadRequest("Problem creating campsite type");
    }
    
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateCampsiteType(int id, CampsiteType campsiteType)
    {
        if (id != campsiteType.Id || !CampsiteTypeExists(id)) return BadRequest("Cannot update this campsite type");
        
        repo.Update(campsiteType);
        
        if (await repo.SaveAllAsync())
        {
            return NoContent();
        }
        
        return BadRequest("Problem updating campsite type");
    }
    
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteCampsiteType(int id)
    {
        var campsiteType = await repo.GetByIdAsync(id);
        
        if (campsiteType == null) return NotFound();
        
        repo.Remove(campsiteType);
        
        if (await repo.SaveAllAsync())
        {
            return NoContent();
        }
        
        return BadRequest("Problem deleting campsite type");
    }
    
    private bool CampsiteTypeExists(int id) => repo.Exists(id);
}