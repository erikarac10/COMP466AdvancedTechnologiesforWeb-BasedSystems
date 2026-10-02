using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

public class IndexModel : PageModel
{
    public int VisitCount { get; private set; }
    public string IPAddress { get; private set; } = "Unknown";
    public string TimeZone { get; private set; } = "Detecting...";

    public IActionResult OnGet(string? timeZone)
    
    {
        //If this request contains a time zone, return it as JSON and stop
        //so AJAX request does not count as another page visit
        if (!string.IsNullOrEmpty(timeZone))
        {
            return new JsonResult(new { timeZone });
        }

        //Handle cookie-based visit tracking
        const string cookieName = "VisitCount";
        int count = 1;

        if (Request.Cookies.TryGetValue(cookieName, out var value) && int.TryParse(value, out var parsedCount))
        {
            count = parsedCount + 1;
        }

        VisitCount = count;

        Response.Cookies.Append(cookieName, count.ToString(), new CookieOptions
        {
            Expires = DateTimeOffset.UtcNow.AddDays(30),
            IsEssential = true,
            HttpOnly = false
        });

        //Attempt to get client IP address
        IPAddress = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "Unknown";

        return Page();
    }
}
