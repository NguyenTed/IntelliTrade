public class MQConsumerOptions
{
  public string ExchangeName { get; set; } = "subs.exchange";
  public string ExchangeType { get; set; } = "direct";
  public List<Binding> Bindings { get; set; } = new();
}
public class Binding
{
  public string QueueName { get; set; }
  public string RoutingKey { get; set; }
}