using RabbitMQ.Client;

namespace websocket.gateway.Infrastructure.Service.shared;

public interface IMassageBrokerConnection
{
  IConnection? Connection { get; }

  public Task Initialize();

}