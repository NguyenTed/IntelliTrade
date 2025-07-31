namespace finance_Socket.Realtime.Updater
{
    public class SendTracker : ISendTracker
    {
        private readonly Dictionary<string, DateTime> _lastSentTime = new();

        public bool IsAbleToSend(string symbol, string interval, DateTime eventTime, bool isFinal, TimeSpan updateInterval)
        {
            var key = $"{symbol}_{interval}";

            if (!_lastSentTime.TryGetValue(key, out var lastTime))
            {
                _lastSentTime[key] = eventTime;
                return true;
            }

            bool shouldSend = isFinal || (eventTime - lastTime) >= updateInterval;

            if (shouldSend)
                _lastSentTime[key] = eventTime;

            return shouldSend;
        }
    }

}