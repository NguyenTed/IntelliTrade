
using System.Net.WebSockets;
using System.Reactive.Linq;
using System.Text;
using System.Text.Json;
using finance_Socket.Realtime.shared;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using Stocks.Realtime;
using Stocks.Realtime.Api.Realtime;
using Websocket.Client;

namespace finance_Socket.Realtime.Updater.Provider
{
    public class BinanceFeedUpdater : StocksFeedUpdater
    {
        private string uri = "wss://stream.binance.com:9443/ws";
        private WebsocketClient _client;
        public BinanceFeedUpdater(
            TickerManager tickerManager,
            IHubContext<StocksFeedHub, IStockUpdateClient> hubContex,
            IOptions<StockUpdateOptions> options,
            ILogger<StocksFeedUpdater> logger)
            : base(tickerManager, hubContex, options, logger)
        {

        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            using var socket = new ClientWebSocket();
            var uri = new Uri("wss://stream.binance.com:9443/ws/btcusdt@kline_1m");

            await socket.ConnectAsync(uri, stoppingToken);

            var buffer = new byte[4096];
            while (!stoppingToken.IsCancellationRequested)
            {
                var result = await socket.ReceiveAsync(new ArraySegment<byte>(buffer), stoppingToken);
                var message = Encoding.UTF8.GetString(buffer, 0, result.Count);

                var doc = JsonDocument.Parse(message);
                if (doc.RootElement.TryGetProperty("k", out JsonElement kline))
                {
                    var update = new StockPriceUpdate
                    {
                        symbol = kline.GetProperty("s").GetString(),
                        open = float.Parse(kline.GetProperty("o").GetString()),
                        high = float.Parse(kline.GetProperty("h").GetString()),
                        low = float.Parse(kline.GetProperty("l").GetString()),
                        close = float.Parse(kline.GetProperty("c").GetString()),
                        volume = float.Parse(kline.GetProperty("v").GetString()),
                        timestamp = DateTimeOffset.FromUnixTimeMilliseconds(kline.GetProperty("t").GetInt64()).UtcDateTime,
                        isFinal = kline.GetProperty("x").GetBoolean()
                    };

                    await HubContext.Clients.Group().ReceiveStockPriceUpdate(update);
                }
            }
        }

    }
}