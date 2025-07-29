using System.Globalization;
using System.Reactive.Linq;
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
        private readonly string _baseUrl = "wss://stream.binance.com:9443/ws";
        private WebsocketClient _client;
        private HashSet<string> _currentStreams = new();
        private Dictionary<string, DateTime> _lastSentTime = new();

        public BinanceFeedUpdater(
            TickerManager tickerManager,
            ISendTracker sendTracker,
            IHubContext<StocksFeedHub, IStockUpdateClient> hubContext,
            IOptions<StockUpdateOptions> options,
            ILogger<StocksFeedUpdater> logger)
            : base(tickerManager, sendTracker, hubContext, options, logger)
        {
            Provider = TickerDataProvider.WEBSOCKETBINANCE;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            Logger.LogInformation("Checked");
            _client = new WebsocketClient(new Uri(_baseUrl));
            _client.ReconnectTimeout = TimeSpan.FromSeconds(30);

            _client.MessageReceived
                .Where(msg => !string.IsNullOrEmpty(msg.Text))
                .Subscribe(HandleMessage);

            await _client.Start();

            Logger.LogInformation("Binance WebSocket started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                var updated = TickerManager.GetActiveTickersOfProvider(Provider)
                    .Select(t => $"{t.ticker.ToLower()}@kline_{t.interval.ToLower()}")
                    .ToHashSet();

                var toAdd = updated.Except(_currentStreams).ToList();
                var toRemove = _currentStreams.Except(updated).ToList();

                if (toAdd.Any())
                    await SubscribeStreams(toAdd);

                if (toRemove.Any())
                    await UnSubscribeStreams(toRemove);

                await Task.Delay(5000, stoppingToken);
            }
        }

        protected override async Task SubscribeStreams(IEnumerable<string> streams)
        {
            if (!streams.Any()) return;
            Logger.LogInformation($"========Subscribe");

            var msg = new
            {
                method = "SUBSCRIBE",
                @params = streams.ToArray(),
                id = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };

            _client.Send(JsonSerializer.Serialize(msg));
            foreach (var stream in streams)
                _currentStreams.Add(stream);

            Logger.LogInformation($"Subscribed streams: {string.Join(", ", streams)}");

            Logger.LogInformation($"===================================");
        }

        protected override async Task UnSubscribeStreams(IEnumerable<string> streams)
        {
            if (!streams.Any()) return;
            Logger.LogInformation($"========Unsubscribe");
            var msg = new
            {
                method = "UNSUBSCRIBE",
                @params = streams.ToArray(),
                id = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()
            };

            _client.Send(JsonSerializer.Serialize(msg));
            foreach (var stream in streams)
                _currentStreams.Remove(stream);

            Logger.LogInformation($"Unsubscribed streams: {string.Join(", ", streams)}");
            Logger.LogInformation($"==============================");
        }

        private void HandleMessage(ResponseMessage msg)
        {
            try
            {
                using var doc = JsonDocument.Parse(msg.Text);
                if (!doc.RootElement.TryGetProperty("k", out var kline))
                    return;

                var eventTime = doc.RootElement.GetProperty("E").GetInt64();
                var eventDateTime = DateTimeOffset.FromUnixTimeMilliseconds(eventTime).UtcDateTime;

                var symbol = kline.GetProperty("s").GetString();
                var interval = kline.GetProperty("i").GetString();
                var open = kline.GetProperty("o").GetString();
                var high = kline.GetProperty("h").GetString();
                var low = kline.GetProperty("l").GetString();
                var close = kline.GetProperty("c").GetString();
                var volume = kline.GetProperty("v").GetString();
                var isFinal = kline.GetProperty("x").GetBoolean();
                var time = kline.GetProperty("t").GetInt64();

                if (!SendTracker.IsAbleToSend(symbol, interval, eventDateTime, isFinal, _options.UpdateInterval))
                    return;

                var update = new StockPriceUpdate
                {
                    Symbol = symbol,
                    Interval = interval,
                    Open = decimal.Parse(open, CultureInfo.InvariantCulture),
                    High = decimal.Parse(high, CultureInfo.InvariantCulture),
                    Low = decimal.Parse(low, CultureInfo.InvariantCulture),
                    Close = decimal.Parse(close, CultureInfo.InvariantCulture),
                    Volume = decimal.Parse(volume, CultureInfo.InvariantCulture),
                    IsFinal = isFinal,
                    Time = DateTimeOffset.FromUnixTimeMilliseconds(time).UtcDateTime
                };

                Logger.LogInformation($"Sending update for {symbol}-{interval} at {eventDateTime:HH:mm:ss} (Final: {isFinal})");
                SendToGroupAsync($"{symbol.ToLower()}:{interval.ToLower()}", update).Wait();
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error handling Binance WebSocket message");
            }
        }
    }
}
