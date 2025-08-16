using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using websocket.gateway.Infrastructure.Service.shared;

public class RabbitMQProducer : IMassageProducer, IAsyncDisposable
{
    private readonly IMassageBrokerConnection _massageBrokerConnection;
    private readonly MQProducerOptions _options;
    private IChannel? _channel;

    public RabbitMQProducer(
        IMassageBrokerConnection massageBrokerConnection,
        IOptions<MQProducerOptions> options)
    {
        _massageBrokerConnection = massageBrokerConnection;
        _options = options.Value;

    }

    public async Task Initialize()
    {
        if (_channel != null) return;

        _channel = await _massageBrokerConnection.Connection.CreateChannelAsync();

        await _channel.ExchangeDeclareAsync(
            exchange: _options.ExchangeName,
            type: _options.ExchangeType,
            durable: true,
            autoDelete: false
        );

        for (int i = 0; i < _options.Bindings.Count; i++)
        {
            var queue = _options.Bindings[i].QueueName;
            var key = _options.Bindings[i].RoutingKey;

            await _channel.QueueDeclareAsync(
                queue: queue,
                durable: true,
                exclusive: false,
                autoDelete: false
            );

            await _channel.QueueBindAsync(
                queue: queue,
                exchange: _options.ExchangeName,
                routingKey: key
            );
        }
    }

    public async Task SendMassage<T>(T message, string routingKey)
    {
        await Initialize();

        var json = JsonSerializer.Serialize(message);
        var body = Encoding.UTF8.GetBytes(json);

        await _channel!.BasicPublishAsync(
            exchange: _options.ExchangeName,
            routingKey: routingKey,
            body: body
        );
    }

    public async ValueTask DisposeAsync()
    {
        if (_channel != null)
            await _channel.DisposeAsync();
    }

}
