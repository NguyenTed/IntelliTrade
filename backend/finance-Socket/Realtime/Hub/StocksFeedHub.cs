using finance_Socket.Realtime.shared;
using Microsoft.AspNetCore.SignalR;

namespace Stocks.Realtime.Api.Realtime;

public class StocksFeedHub : Hub<IStockUpdateClient>
{
    private readonly TickerManager _tickerManager;
    public StocksFeedHub(
        TickerManager tickerManager)
    {
        _tickerManager = tickerManager;
    }
    public async Task JoinStockGroup(string ticker, string interval = "1m")
    {
        if (ticker == null)
            return;
        await Groups.AddToGroupAsync(Context.ConnectionId, $"{ticker}:{interval}");
        _tickerManager.AddTicker(ticker, interval);
    }

    public async Task LeaveStockGroup(string ticker, string interval)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"{ticker}:{interval}");
        _tickerManager.RemoveConnection(ticker, interval);
    }
};
