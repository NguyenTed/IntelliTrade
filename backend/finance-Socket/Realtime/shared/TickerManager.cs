namespace finance_Socket.Realtime.shared
{
    public class TickerManager
    {
        private Dictionary<TickerDataProvider, List<TickerGroup>> _tickers;

        public TickerManager()
        {
            _tickers = new Dictionary<TickerDataProvider, List<TickerGroup>>();
        }

        public void AddTicker(TickerDataProvider provider, string ticker)
        {
            if (ticker == null || provider == null)
            {
                return;
            }

            if (!_tickers.ContainsKey(provider))
            {
                _tickers[provider] = new List<TickerGroup>();
            }

            var group = _tickers[provider].FirstOrDefault(t => t.ticker == ticker);
            if (group == null)
            {
                _tickers[provider].Add(new TickerGroup(ticker));
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

        public Dictionary<TickerDataProvider, List<string>> GetAllActiveTickers()
        {
            return _tickers.ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value.Where(x => x.NumberofConnections > 0).Select(tg => tg.ticker).ToList()
            );
        }

        public void RemoveConnection(string ticker)
        {
            if (string.IsNullOrEmpty(ticker))
            {
                return;
            }

            foreach (var provider in _tickers.Keys.ToList())
            {
                var group = _tickers[provider].FirstOrDefault(t => t.ticker == ticker);
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