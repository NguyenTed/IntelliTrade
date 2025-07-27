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

        public StocksFeedUpdater(
            TickerManager tickerManager,
            IHubContext<StocksFeedHub, IStockUpdateClient> hubContex,
            IOptions<StockUpdateOptions> options,
            ILogger<StocksFeedUpdater> logger)
        {
            this.TickerManager = tickerManager;
            this.HubContext = hubContex;
            // this.Options = options;
            this.Logger = logger;
            this._options = options.Value;
        }


        protected async Task SendToGroupAsync(string groupName, StockPriceUpdate data)
        {
            await HubContext.Clients.Group(groupName).ReceiveStockPriceUpdate(data);
        }
    }
}