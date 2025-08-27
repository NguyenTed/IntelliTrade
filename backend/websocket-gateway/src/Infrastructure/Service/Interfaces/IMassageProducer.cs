public interface IMassageProducer
{
  Task SendMassage<T>(T massage, string routingKey);
}