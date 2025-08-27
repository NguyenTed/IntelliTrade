using System.Text;
using System.Text.Json;
using finance_Socket.Realtime.shared;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Stocks.Realtime;
using Stocks.Realtime.Api.Realtime;
using websocket.gateway.Infrastructure.Service.shared;

public class RabbitMQConsumer : IMessageConsumer, IAsyncDisposable
{
  private readonly IMassageBrokerConnection _massageBrokerConnection;
  private readonly MQConsumerOptions _consumerOptions;
  private readonly TickerManager _tickerManager;
  private IChannel? _channel;
  private string? _queueName;

  public RabbitMQConsumer(
      IMassageBrokerConnection massageBrokerConnection,
      IOptions<MQConsumerOptions> consumerOptions,
      TickerManager tickerManager)
  {
    _massageBrokerConnection = massageBrokerConnection ?? throw new ArgumentNullException(nameof(massageBrokerConnection));
    _consumerOptions = consumerOptions.Value ?? throw new ArgumentNullException(nameof(consumerOptions));
    _tickerManager = tickerManager;
  }

  public async Task Initialize()
  {
    if (_channel != null) return;
    if (_massageBrokerConnection.Connection == null) return;

    _channel = await _massageBrokerConnection.Connection.CreateChannelAsync();

    await _channel.ExchangeDeclareAsync(
        exchange: _consumerOptions.ExchangeName,
        type: _consumerOptions.ExchangeType,
        durable: true,
        autoDelete: false
    );

    // Đăng ký tất cả các queue theo config
    // sub queue
    await _channel.QueueDeclareAsync(
          queue: "subs.queue",
          durable: true,
          exclusive: false,
          autoDelete: false
      );

    await _channel.QueueBindAsync(
          queue: "subs.queue",
          exchange: _consumerOptions.ExchangeName,
          routingKey: "sub"
      );

    await StartConsuming("subs.queue", AddNewTicker);


    await _channel.QueueDeclareAsync(
          queue: "unsubs.queue",
          durable: true,
          exclusive: false,
          autoDelete: false
      );

    await _channel.QueueBindAsync(
          queue: "unsubs.queue",
          exchange: _consumerOptions.ExchangeName,
          routingKey: "unsub"
      );

    await StartConsuming("unsubs.queue", RemoveTicker);
  }

  private async Task StartConsuming(string queue, Action<TickerRecieved> func)
  {
    var consumer = new AsyncEventingBasicConsumer(_channel);
    consumer.ReceivedAsync += async (model, ea) =>
    {
      try
      {
        var body = ea.Body.ToArray();
        var json = Encoding.UTF8.GetString(body);
        var message = JsonSerializer.Deserialize<TickerRecieved>(json);

        func(message);
        await _channel.BasicAckAsync(ea.DeliveryTag, false);
      }
      catch (Exception ex)
      {
        Console.WriteLine($"[x] Error: {ex.Message}");
        await _channel.BasicNackAsync(ea.DeliveryTag, false, true);
      }
    };

    await _channel.BasicConsumeAsync(queue: queue, autoAck: false, consumer: consumer);
  }

  public async ValueTask DisposeAsync()
  {
    if (_channel != null)
      await _channel.DisposeAsync();
  }

  private void AddNewTicker(TickerRecieved ticket)
  {
      Console.WriteLine($"Add New ticker recieved {ticket.Symbol} - {ticket.Interval}");
    _tickerManager.AddTicker(ticket.Symbol, ticket.Interval);
  }
  private void RemoveTicker(TickerRecieved ticket)
  {
    Console.WriteLine($"Remove ticket : {ticket.Symbol} - {ticket.Interval}");
    _tickerManager.RemoveConnection(ticket.Symbol, ticket.Interval);
  }
}
