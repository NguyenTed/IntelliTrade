using System.Collections.Concurrent;
using websocket.gatewat.shared;

namespace websocket.gateway.Shared
{
    public class TickerManager
    {
        private readonly ConcurrentDictionary<string, TickerGroup> _tickers;
        private readonly IMassageProducer _massageProducer;

        public TickerManager(IMassageProducer _massageProducer)
        {
            _tickers = new();
            this._massageProducer = _massageProducer;
        }

        private static string GetKey(string ticker, string interval)
        {
            return $"{ticker.Trim().ToUpperInvariant()}_{interval.Trim().ToLowerInvariant()}";
        }

        public async void AddTicker(string ticker, string interval)
        {
            if (string.IsNullOrWhiteSpace(ticker) || string.IsNullOrWhiteSpace(interval))
                return;

            var key = GetKey(ticker, interval);
            bool IsSend = false;

            _tickers.AddOrUpdate(
                key,
                _ =>
                {
                    IsSend = true;
                    return new TickerGroup(ticker, interval);
                },
                (_, existingGroup) =>
                {
                    existingGroup.NumberofConnections++;
                    return existingGroup;
                }
            );

            if (IsSend)
            {
                await _massageProducer.SendMassage<TickerJointStock>(new TickerJointStock(ticker, interval), "sub");
            }
        }

        public void RemoveConnection(string ticker, string interval)
        {
            if (string.IsNullOrWhiteSpace(ticker) || string.IsNullOrWhiteSpace(interval))
                return;

            var key = GetKey(ticker, interval);

            if (_tickers.TryGetValue(key, out var group))
            {
                if (group.NumberofConnections > 0)
                    group.NumberofConnections--;
            }
        }

        public List<TickerGroup> GetAllActiveTickers()
        {
            return _tickers.Values
                           .Where(g => g.NumberofConnections > 0)
                           .ToList();
        }
    }
}
