using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using part4.Models;

var builder = WebApplication.CreateBuilder(args);

//---------- Services Configuration ----------//

builder.Services.AddRazorPages();
builder.Services.AddControllers();

//Allow invalid model state
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

//Enable session storage
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

//Configure connection string to local database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

//Retry on failure for transient SQL errors
builder.Services.AddDbContext<OnlineComputerStore>(options =>
    options.UseSqlServer(connectionString, sqlServerOptions => 
        sqlServerOptions.EnableRetryOnFailure()));

//Configure JSON options to preserve property names
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = null;
    });

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<OnlineComputerStore>();
    db.Database.EnsureCreated();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

//Allow access to shared static assets (assignment shared folder)
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(Directory.GetCurrentDirectory(), "../shared")),
    RequestPath = "/shared"
});

app.UseHttpsRedirection();
app.UseRouting();
app.UseSession();
app.MapControllers();
app.UseAuthorization();
app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();

app.Run();