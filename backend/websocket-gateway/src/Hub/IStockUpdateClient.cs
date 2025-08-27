using websocket.gateway.Hub;

namespace websocket.Gateway.Hub;

public interface IStockUpdateClient
{
    Task ReceiveStockPriceUpdate(StockPriceUpdate update);
}
