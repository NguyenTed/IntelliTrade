using finance_Socket.Realtime.shared;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using Stocks.Realtime;
using Stocks.Realtime.Api.Realtime;

namespace finance_Socket.Realtime.Updater
{
    public abstract class StocksFeedUpdater : BackgroundService
    {
        protected readonly TickerManager TickerManager;
        protected readonly IHubContext<StocksFeedHub, IStockUpdateClient> HubContext;
        // protected readonly IOptions<StockUpdateOptions> Options;
        protected readonly ILogger<StocksFeedUpdater> Logger;
        protected readonly StockUpdateOptions _options;
        protected TickerDataProvider Provider;
        protected readonly ISendTracker SendTracker;

        private readonly Dictionary<string, DateTime> _lastSentTime = new();

        public StocksFeedUpdater(
            TickerManager tickerManager,
            ISendTracker sendTracker,
            IHubContext<StocksFeedHub, IStockUpdateClient> hubContex,
            IOptions<StockUpdateOptions> options,
            ILogger<StocksFeedUpdater> logger)
        {
            this.TickerManager = tickerManager;
            this.HubContext = hubContex;
            this.Logger = logger;
            this._options = options.Value;
            this.SendTracker = sendTracker;
        }


        protected async Task SendToGroupAsync(string groupName, StockPriceUpdate data)
        {
            Logger.LogInformation($"Sending update to group {groupName}: {data}");
            await HubContext.Clients.Group(groupName).ReceiveStockPriceUpdate(data);
        }

        protected abstract Task SubscribeStreams(IEnumerable<string> streams);
        protected abstract Task UnSubscribeStreams(IEnumerable<string> streams);
    }
}