using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using RabbitMQ.Client;
using websocket.gateway.Infrastructure.Service.shared;
public class RabitMQConnection : IMassageBrokerConnection, IDisposable
{
  private IConnection? _connection;
  private MessageBrokerOptions _messageBrokerOptions;
  public IConnection Connection => _connection!;

  public RabitMQConnection(IOptions<MessageBrokerOptions> massageBrokerOptions)
  {
    _messageBrokerOptions = massageBrokerOptions.Value;
  }
  public async Task Initialize()
  {
    var factory = new ConnectionFactory
    {
      HostName = _messageBrokerOptions.HostName,
      Port = _messageBrokerOptions.Port
    };
    _connection = await factory.CreateConnectionAsync();
  }

  public void Dispose()
  {
    _connection?.Dispose();
  }
}