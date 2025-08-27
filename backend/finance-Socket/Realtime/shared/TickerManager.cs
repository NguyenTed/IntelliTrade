using System.Collections.Concurrent;

namespace finance_Socket.Realtime.shared
{
    public class TickerManager
    {
        private readonly ConcurrentDictionary<TickerDataProvider, ConcurrentDictionary<string, TickerGroup>> _tickers;

        public TickerManager()
        {
            _tickers = new();
        }

        private static string GetKey(string ticker, string interval)
        {
            return $"{ticker.Trim().ToUpperInvariant()}_{interval.Trim().ToLowerInvariant()}";
        }

       public void AddTicker(string ticker, string interval, TickerDataProvider provider = TickerDataProvider.WEBSOCKETBINANCE)
        {
            if (string.IsNullOrWhiteSpace(ticker) || string.IsNullOrWhiteSpace(interval))
                return;

            var key = GetKey(ticker, interval);

            var providerDict = _tickers.GetOrAdd(provider, _ => new());

            providerDict.AddOrUpdate(
                key,
                _ => new TickerGroup(ticker, interval) { NumberofConnections = 1 },
                (_, existingGroup) =>
                {
                    existingGroup.NumberofConnections++;
                    return existingGroup;
                }
            );
        }

        public void RemoveConnection(string ticker, string interval, TickerDataProvider provider = TickerDataProvider.WEBSOCKETBINANCE)
        {
            if (string.IsNullOrWhiteSpace(ticker) || string.IsNullOrWhiteSpace(interval))
                return;

            var key = GetKey(ticker, interval);

            foreach (var providerEntry in _tickers)
            {
                if (providerEntry.Value.TryGetValue(key, out var group))
                {
                    if (group.NumberofConnections > 0)
                        group.NumberofConnections--;

                    break;
                }
            }
        }

        public List<TickerGroup> GetActiveTickersOfProvider(TickerDataProvider provider)
        {
            if (_tickers.TryGetValue(provider, out var providerDict))
            {
                return providerDict.Values.Where(x => x.NumberofConnections > 0).ToList();
            }
            return new();
        }

        public Dictionary<TickerDataProvider, List<TickerGroup>> GetAllActiveTickers()
        {
            return _tickers.ToDictionary(
                kvp => kvp.Key,
                kvp => kvp.Value.Values.Where(g => g.NumberofConnections > 0).ToList()
            );
        }
    }
}
