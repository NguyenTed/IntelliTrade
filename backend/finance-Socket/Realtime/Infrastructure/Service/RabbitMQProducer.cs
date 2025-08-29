using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using websocket.gateway.Infrastructure.Service.shared;

public class RabbitMQProducer : IMassageProducer, IAsyncDisposable
{
    private readonly IMassageBrokerConnection? _massageBrokerConnection;
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

        if (_massageBrokerConnection == null || _massageBrokerConnection.Connection == null)
            return;

        _channel = await _massageBrokerConnection.Connection.CreateChannelAsync();

        await _channel.ExchangeDeclareAsync(
            exchange: _options.ExchangeName,
            type: _options.ExchangeType,
            durable: true,
            autoDelete: false
        );
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
