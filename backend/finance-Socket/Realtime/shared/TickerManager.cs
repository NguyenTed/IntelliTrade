namespace finance_Socket.Realtime.shared
{
    public class TickerManager
    {
        private Dictionary<TickerDataProvider, List<TickerGroup>> _tickers;

        public TickerManager()
        {
            _tickers = new Dictionary<TickerDataProvider, List<TickerGroup>>();
        }

        public void AddTicker(string ticker, string interval, TickerDataProvider provider = TickerDataProvider.WEBSOCKETBINANCE)
        {
            if (ticker == null || provider == null || interval == null)
            {
                return;
            }

            if (!_tickers.ContainsKey(provider))
            {
                _tickers[provider] = new List<TickerGroup>();
            }

            var group = _tickers[provider].FirstOrDefault(t => t.ticker == ticker && t.interval == interval);
            if (group == null)
            {
                _tickers[provider].Add(new TickerGroup(ticker, interval));
            }
            else
            {
                group.NumberofConnections++;
            }
        }

        public List<TickerGroup> GetActiveTickersOfProvider(TickerDataProvider provider)
        {
            if (_tickers.ContainsKey(provider))
            {
                return _tickers[provider].Where(x => x.NumberofConnections > 0).ToList();
            }
            return new List<TickerGroup>();
        }

        public Dictionary<TickerDataProvider, List<TickerGroup>> GetAllActiveTickers()
        {
            return _tickers.ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value.Where(x => x.NumberofConnections > 0).ToList()
            );
        }

        public void RemoveConnection(string ticker, string interval)
        {
            if (string.IsNullOrEmpty(ticker))
            {
                return;
            }

            foreach (var provider in _tickers.Keys.ToList())
            {
                var group = _tickers[provider].FirstOrDefault(t => t.ticker == ticker && t.interval == interval);
                if (group != null)
                {
                    if(group.NumberofConnections > 0)
                    {
                        group.NumberofConnections--;
                    }
                    return;
                }
            }
        }
    }
}