using finance_Socket.Realtime.shared;
using finance_Socket.Realtime.Updater;
using finance_Socket.Realtime.Updater.Provider;
using Stocks.Realtime.Api.Realtime;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();
builder.Services.AddMemoryCache();
builder.Services.AddSignalR();

// logging configuration
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Debug);


// Add services to the container.
builder.Services.AddSingleton<TickerManager>();
builder.Services.Configure<StockUpdateOptions>(builder.Configuration.GetSection("StockUpdateOptions"));
builder.Services.AddHostedService<BinanceFeedUpdater>();
builder.Services.AddTransient<ISendTracker, SendTracker>();



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
