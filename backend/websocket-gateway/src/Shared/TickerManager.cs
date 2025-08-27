using System.Collections.Concurrent;
using websocket.gatewat.shared;

namespace websocket.gateway.Shared
{
    public class TickerManager
    {
        private readonly ConcurrentDictionary<string, TickerGroup> _tickers;
        private readonly IMassageProducer _massageProducer;
        private readonly IMessageConsumer _massageConsumer;

        public TickerManager(IMassageProducer _massageProducer, IMessageConsumer massageConsumer)
        {
            _tickers = new();
            this._massageProducer = _massageProducer;
            _massageConsumer = massageConsumer;
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
            bool isNew = false;

            // Sử dụng AddOrUpdate và trả về trạng thái isNew
            _tickers.AddOrUpdate(
                key,
                _ =>
                {
                    isNew = true; // Đánh dấu là tạo mới
                    return new TickerGroup(ticker, interval);
                },
                (_, existingGroup) =>
                {
                    if (existingGroup.NumberofConnections <= 0)
                        isNew = true;
                    existingGroup.NumberofConnections++;
                    return existingGroup;
                }
            );

            // Thêm await Task.Yield() để đảm bảo lambda executed trước
            await Task.Yield();

            if (isNew)
            {
                Console.WriteLine($"🚀 Sending SUB message for: {ticker} - {interval}");
                await _massageConsumer.AddNewTicket(ticker, interval);
                await _massageProducer.SendMassage<TickerJointStock>(new TickerJointStock(ticker, interval), "sub");
            }
        }

        public async Task RemoveConnection(string ticker, string interval)
        {
            if (string.IsNullOrWhiteSpace(ticker) || string.IsNullOrWhiteSpace(interval))
                return;

            var key = GetKey(ticker, interval);

            if (_tickers.TryGetValue(key, out var group))
            {
                if (group.NumberofConnections > 0)
                    group.NumberofConnections--;

                if (group.NumberofConnections == 0)
                {
                    await _massageConsumer.RemoveTicket(ticker, interval);
                    await _massageProducer.SendMassage<TickerJointStock>(new TickerJointStock(ticker, interval), "unsub");
                }
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
