using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;

//Index page for cookie-based cart storage
public class IndexModel : PageModel
{
    public List<Cart> Orders { get; private set; } = new();

    //---------- Load Orders from Cookie ----------
    public IActionResult OnGet()
    {
        const string cookieName = "Orders";

        if (Request.Cookies.TryGetValue(cookieName, out var cookieValue))
        {
            try
            {
                Orders = JsonSerializer.Deserialize<List<Cart>>(cookieValue) ?? new();
            }
            catch (JsonException)
            {
                Orders = new(); //Fallback if cookie corrupted
            }
        }

        return Page();
    }

    //---------- Add New Order to Cookie ----------
    [HttpPost]
    public IActionResult OnPostAddOrder([FromBody] Cart newCart)
    {
        const string cookieName = "Orders";

        //Retrieve existing orders
        var orders = new List<Cart>();
        if (Request.Cookies.TryGetValue(cookieName, out var cookieValue))
        {
            try
            {
                orders = JsonSerializer.Deserialize<List<Cart>>(cookieValue) ?? new();
            }
            catch (JsonException ex)
            {
                return new JsonResult(new { success = false, message = ex});
            }
        }

        //Add new order
        newCart.OrderID = orders.Count > 0 ? orders.Max(o => o.OrderID ?? 0) + 1 : 1;
        newCart.OrderDate = DateTime.UtcNow;
        orders.Add(newCart);

        //Serialize and save back to cookie
        var json = JsonSerializer.Serialize(orders);
        Response.Cookies.Append(cookieName, json, new CookieOptions
        {
            HttpOnly = false,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Expires = DateTimeOffset.UtcNow.AddDays(7)
        });

        return new JsonResult(new { success = true, message = "Order saved", orderID = newCart.OrderID });
    }

    //---------- Cart ----------
    public class Cart
    {
        public int? OrderID { get; set; }
        public DateTime? OrderDate { get; set; }
        public int? OrderStatus { get; set; } = 0;
        public string? OrderStatusMessage { get; set; }

        public int BuildID { get; set; }
        public string? BuildName { get; set; }
        public string? BuildDescription { get; set; }

        public int OSID { get; set; }
        public string? OSName { get; set; }
        public decimal OSPrice { get; set; }

        public int CPUID { get; set; }
        public string? CPUName { get; set; }
        public decimal CPUPrice { get; set; }

        public int RAMID { get; set; }
        public string? RAMName { get; set; }
        public decimal RAMPrice { get; set; }

        public int HardDriveID { get; set; }
        public string? HardDriveName { get; set; }
        public decimal HardDrivePrice { get; set; }

        public int SoundCardID { get; set; }
        public string? SoundCardName { get; set; }
        public decimal SoundCardPrice { get; set; }

        public int DisplayID { get; set; }
        public string? DisplayName { get; set; }
        public decimal DisplayPrice { get; set; }

        public decimal TotalPrice { get; set; }
    }
}