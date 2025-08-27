using finance_Socket.Realtime.shared;
using finance_Socket.Realtime.Updater;
using finance_Socket.Realtime.Updater.Provider;
using Stocks.Realtime.Api.Realtime;
using websocket.gateway.Infrastructure.Service.shared;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();
builder.Services.AddMemoryCache();
// builder.Services.AddSignalR();

// logging configuration
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Debug);


// Configuration
builder.Services.Configure<StockUpdateOptions>(builder.Configuration.GetSection("StockUpdateOptions"));
builder.Services.Configure<MessageBrokerOptions>(builder.Configuration.GetSection("MassageBrokerConnections"));
builder.Services.Configure<MQConsumerOptions>(builder.Configuration.GetSection("MQConsumerOptions"));
builder.Services.Configure<MQProducerOptions>(builder.Configuration.GetSection("MQProducerOptions"));


// Add services to the container.
builder.Services.AddSingleton<TickerManager>();
builder.Services.AddHostedService<BinanceFeedUpdater>();
builder.Services.AddTransient<ISendTracker, SendTracker>();

builder.Services.AddSingleton<IMassageBrokerConnection, RabitMQConnection>();
builder.Services.AddSingleton<IMassageProducer, RabbitMQProducer>();
builder.Services.AddSingleton<IMessageConsumer, RabbitMQConsumer>();



var app = builder.Build();

// Initialize the Rabit MQ
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
        await consumer.Initialize();
    }

    Console.WriteLine("Successfull connect to rabitmq");
}
catch (Exception e)
{
    Console.WriteLine("", e);
}
// ===========

if (app.Environment.IsDevelopment())
{
    app.UseCors(policy => policy
        .WithOrigins(builder.Configuration["Cors:AllowedOrigin"]!)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
}

// app.MapHub<StocksFeedHub>("/stocks-feed");
app.UseHttpsRedirection();

app.Run();
