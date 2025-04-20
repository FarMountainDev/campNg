using Core.Interfaces;
using Core.Models;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class CartController(ICartService cartService) : BaseApiController
{
    [HttpGet]
    public async Task<ActionResult<ShoppingCart>> GetCartById(string id)
    {
        var cart = await cartService.GetCartAsync(id);
        
        return Ok(cart ?? new ShoppingCart{Id = id});
    }
    
    [HttpPost]
    public async Task<ActionResult<ShoppingCart>> UpdateCart(ShoppingCart cart)
    {
        var updatedCart = await cartService.SetCartAsync(cart);
        
        if (updatedCart is null) return BadRequest(new ProblemDetails{Title = "Problem saving cart"});
        
        return Ok(updatedCart);
    }
    
    [HttpDelete]
    public async Task<ActionResult<bool>> DeleteCart(string id)
    {
        var deleted = await cartService.DeleteCartAsync(id);
        
        if (!deleted) return BadRequest(new ProblemDetails{Title = "Problem deleting cart"});
        
        return Ok(deleted);
    }

    [HttpGet("pending")]
    public async Task<ActionResult> GetPendingReservations()
    {
        var pendingReservations = await cartService.GetAllPendingReservations();

        return Ok(pendingReservations);
    }
}