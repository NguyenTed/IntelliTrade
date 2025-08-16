using Stocks.Realtime.Api.Realtime;
using websocket.gateway.Infrastructure.Service.shared;
using websocket.gateway.Shared;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();
builder.Services.AddMemoryCache();
builder.Services.AddSignalR();


// logging configuration
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Debug);


// Initialize the connection of RabbitMQ
var senderConnection = new RabitMQConnection();
try
{
    await senderConnection.Initialize();
    Console.WriteLine("RabbitMQ Producer initialized");
}
catch(Exception ex)
{
    Console.WriteLine($"RabbitMQ init failed: {ex.Message}");
}

// Add service
builder.Services.AddSingleton<TickerManager>();
builder.Services.AddSingleton<IMassageBrokerConnection>(senderConnection);
builder.Services.AddSingleton<IMassageProducer, RabbitMQProducer>();

// Configuration
builder.Services.Configure<MQProducerOptions>(builder.Configuration.GetSection("MQProducerOptions"));




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