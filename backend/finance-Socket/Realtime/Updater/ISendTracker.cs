namespace finance_Socket.Realtime.Updater
{
    public interface ISendTracker
    {
        public bool IsAbleToSend(string symbol, string interval, DateTime eventTime, bool isFinal, TimeSpan updateInterval);
    }
}