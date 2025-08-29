using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Stocks.Realtime.Api.Realtime;
using websocket.gateway.Hub;
using websocket.gateway.Infrastructure.Service.shared;
using websocket.Gateway.Hub;

public class RabbitMQConsumer : IMessageConsumer, IAsyncDisposable
{
  private readonly IMassageBrokerConnection _massageBrokerConnection;
  private readonly IHubContext<StocksFeedHub, IStockUpdateClient> _hubContext;
  private readonly MQConsumerOptions _consumerOptions;
  private IChannel? _channel;
  private string? _queueName;

  public RabbitMQConsumer(
      IMassageBrokerConnection massageBrokerConnection,
      IOptions<MQConsumerOptions> consumerOptions,
      IHubContext<StocksFeedHub, IStockUpdateClient> hubContex)
  {
    _hubContext = hubContex;
    _massageBrokerConnection = massageBrokerConnection ?? throw new ArgumentNullException(nameof(massageBrokerConnection));
    _consumerOptions = consumerOptions.Value ?? throw new ArgumentNullException(nameof(consumerOptions));
  }
  public async Task InitializeAsync()
  {
    if (_channel != null)
      return;

    _channel = await _massageBrokerConnection.Connection.CreateChannelAsync();


    await _channel.ExchangeDeclareAsync(
        exchange: _consumerOptions.ExchangeName,
        type: ExchangeType.Topic,
        durable: true
    );

    _queueName = $"gateway_{Guid.NewGuid()}";
    await _channel.QueueDeclareAsync(
        queue: _queueName,
        durable: true,
        exclusive: false,
        autoDelete: false
    );

    var consumer = new AsyncEventingBasicConsumer(_channel);

    consumer.ReceivedAsync += async (model, ea) =>
    {
      var json = Encoding.UTF8.GetString(ea.Body.ToArray());
      try
      {
        var stockUpdate = JsonSerializer.Deserialize<StockPriceUpdate>(json);

        if (stockUpdate == null)
        {
          throw new Exception($"Can not parse Massage : {json}");
        }

        await HandleMessageAsync(stockUpdate, ea.RoutingKey);

        await _channel.BasicAckAsync(ea.DeliveryTag, multiple: false);
      }
      catch (Exception ex)
      {
        Console.WriteLine($"[ERROR] {ex.Message}");
        await _channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: false);
      }
    };

    await _channel.BasicConsumeAsync(
        queue: _queueName,
        autoAck: false,
        consumer: consumer
    );
  }

  private async Task HandleMessageAsync(StockPriceUpdate stock, string routingKey)
  {
    await SendToGroupAsync($"{stock.Symbol.ToLower()}:{stock.Interval.ToLower()}", stock);
  }

  private async Task SendToGroupAsync(string groupName, StockPriceUpdate data)
  {
    Console.WriteLine("=====");
    Console.WriteLine($"{data.Symbol} -- {data.Interval}");
    Console.WriteLine("=====");
    await _hubContext.Clients.Group(groupName).ReceiveStockPriceUpdate(data);
  }


  public async Task AddNewTicket(string ticket, string interval)
  {
    await InitializeAsync();
    var routingKey = $"{ticket.ToLower()}.{interval.ToLower()}";

    if (_channel != null && _queueName != null)
    {
      await _channel.QueueBindAsync(_queueName, _consumerOptions.ExchangeName, routingKey);
      Console.WriteLine($"✅ Added binding for ticket {ticket} with interval {interval}");
    }
  }

  public async Task RemoveTicket(string ticket, string interval)
  {
    await InitializeAsync();
    var routingKey = $"{ticket.ToLower()}.{interval.ToLower()}";

    if (_channel != null && _queueName != null)
    {
      await _channel.QueueUnbindAsync(_queueName, _consumerOptions.ExchangeName, routingKey);
      Console.WriteLine($"❌ Removed binding for ticket {ticket} with interval {interval}");
    }
  }

  public async ValueTask DisposeAsync()
  {
    if (_channel != null)
    {
      await _channel.CloseAsync();
    }
  }
}
