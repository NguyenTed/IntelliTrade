using Microsoft.AspNetCore.SignalR;
using websocket.gateway.Shared;
using websocket.Gateway.Hub;

namespace Stocks.Realtime.Api.Realtime;

public class StocksFeedHub : Hub<IStockUpdateClient>
{
    private readonly TickerManager _tickerManager;

    private static readonly Dictionary<string, List<(string ticker, string interval)>> _connections =
        new();

    public StocksFeedHub(TickerManager tickerManager)
    {
        _tickerManager = tickerManager;
    }

    public async Task JoinStockGroup(string ticker, string interval)
    {
        if (ticker == null || interval == null || ticker == "" || interval == "") return;

        string group = $"{ticker.ToLower()}:{interval.ToLower()}";
        await Groups.AddToGroupAsync(Context.ConnectionId, group);
        _tickerManager.AddTicker(ticker, interval);

        lock (_connections)
        {
            if (!_connections.ContainsKey(Context.ConnectionId))
                _connections[Context.ConnectionId] = new();
            _connections[Context.ConnectionId].Add((ticker, interval));
        }

        Console.WriteLine($"Client {Context.ConnectionId} joined group {group}");
    }

    public async Task LeaveStockGroup(string ticker, string interval = "1m")
    {
        string group = $"{ticker.ToLower()}:{interval.ToLower()}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, group);
        _tickerManager.RemoveConnection(ticker, interval);

        lock (_connections)
        {
            if (_connections.TryGetValue(Context.ConnectionId, out var list))
            {
                list.RemoveAll(x => x.ticker == ticker && x.interval == interval);
                if (list.Count == 0) _connections.Remove(Context.ConnectionId);
            }
        }

        Console.WriteLine($"Client {Context.ConnectionId} left group {group}");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        Console.WriteLine($"Client {Context.ConnectionId} disconnected");

        lock (_connections)
        {
            if (_connections.TryGetValue(Context.ConnectionId, out var list))
            {
                foreach (var (ticker, interval) in list)
                {
                    _tickerManager.RemoveConnection(ticker, interval);
                }

                _connections.Remove(Context.ConnectionId);
            }
        }

        await base.OnDisconnectedAsync(exception);
    }
}

