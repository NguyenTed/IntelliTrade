using System.Threading.Tasks;
using RabbitMQ.Client;
using websocket.gateway.Infrastructure.Service.shared;
public class RabitMQConnection : IMassageBrokerConnection, IDisposable
{
  private IConnection? _connection;
  public IConnection Connection => _connection!;

  public RabitMQConnection()
  {
  }
  public async Task Initialize()
  {
    var factory = new ConnectionFactory
    {
      HostName = "localhost"
    };
    _connection = await factory.CreateConnectionAsync();
  }

  public void Dispose()
  {
    _connection?.Dispose();
  }
}