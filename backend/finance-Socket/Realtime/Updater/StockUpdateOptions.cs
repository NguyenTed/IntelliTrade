namespace Stocks.Realtime.Api.Realtime;

public class StockUpdateOptions
{
    public TimeSpan UpdateInterval { get; set; } = TimeSpan.FromSeconds(5);
}
