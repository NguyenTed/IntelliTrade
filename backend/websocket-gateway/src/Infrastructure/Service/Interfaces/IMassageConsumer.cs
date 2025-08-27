public interface IMessageConsumer
{
  Task AddNewTicket(string ticket, string interval);
  Task RemoveTicket(string ticket, string interval);
}