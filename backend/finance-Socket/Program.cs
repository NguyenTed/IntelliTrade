using finance_Socket.Realtime.shared;
using Stocks.Realtime.Api.Realtime;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();
builder.Services.AddMemoryCache();
builder.Services.AddSignalR();


// Add services to the container.
builder.Services.AddSingleton<TickerManager>();
// builder.Services.AddHostedService<>();
builder.Services.Configure<StockUpdateOptions>(builder.Configuration.GetSection("StockUpdateOptions"));


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseCors(policy => policy
        .WithOrigins(builder.Configuration["Cors:AllowedOrigin"]!)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
}

app.MapHub<StocksFeedHub>("/stocks-feed");
app.UseHttpsRedirection();

app.Run();
