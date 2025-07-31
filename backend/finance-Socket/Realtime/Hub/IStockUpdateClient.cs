namespace Stocks.Realtime;

public interface IStockUpdateClient
{
    Task ReceiveStockPriceUpdate(StockPriceUpdate update);
}
