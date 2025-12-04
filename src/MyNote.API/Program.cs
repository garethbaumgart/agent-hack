using Microsoft.EntityFrameworkCore;
using MyNote.Application;
using MyNote.Infrastructure;
using MyNote.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Get allowed origins from configuration or use default
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:4200"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Apply database migrations on startup (for PostgreSQL)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    // Only run migrations if not using InMemory database
    if (!string.IsNullOrEmpty(connectionString) && !connectionString.Contains("InMemory"))
    {
        context.Database.Migrate();
    }
    else
    {
        // Ensure InMemory database is created
        context.Database.EnsureCreated();
    }
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAngular");
app.MapControllers();

app.Run();
