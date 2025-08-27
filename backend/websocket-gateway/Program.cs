using Microsoft.Extensions.Options;
using Stocks.Realtime.Api.Realtime;
using websocket.gateway.Infrastructure.Service.shared;
using websocket.gateway.Shared;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
builder.Services.AddMemoryCache();
builder.Services.AddSignalR();


// logging configuration
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Debug);

// Configuration for options
builder.Services.Configure<MQProducerOptions>(builder.Configuration.GetSection("MQProducerOptions"));
builder.Services.Configure<MessageBrokerOptions>(builder.Configuration.GetSection("MassageBrokerConnections"));
builder.Services.Configure<MQConsumerOptions>(builder.Configuration.GetSection("MQConsumerOptions"));

// Add service
builder.Services.AddSingleton<TickerManager>();
builder.Services.AddSingleton<IMassageBrokerConnection, RabitMQConnection>();
builder.Services.AddSingleton<IMassageProducer, RabbitMQProducer>();
builder.Services.AddSingleton<IMessageConsumer, RabbitMQConsumer>();

builder.WebHost.ConfigureKestrel(options => { /* giữ nguyên port */ });
var app = builder.Build();


try
{
    var rabbitConnection = app.Services.GetRequiredService<IMassageBrokerConnection>();
    await rabbitConnection.Initialize();

    var producer = app.Services.GetRequiredService<IMassageProducer>() as RabbitMQProducer;
    if (producer != null)
    {
        await producer.Initialize();
    }

    var consumer = app.Services.GetRequiredService<IMessageConsumer>() as RabbitMQConsumer;
    if (consumer != null)
    {
        await consumer.InitializeAsync();
    }

    Console.WriteLine("✅ RabbitMQ services initialized successfully.");
}
catch (Exception ex)
{
    Console.ForegroundColor = ConsoleColor.Red;
    Console.WriteLine("❌ Failed to initialize RabbitMQ services.");
    Console.WriteLine($"Error: {ex.Message}");
    Console.ResetColor();
}


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