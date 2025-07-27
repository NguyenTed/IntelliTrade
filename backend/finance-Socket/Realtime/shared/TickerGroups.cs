namespace finance_Socket.Realtime.shared
{
    public sealed class TickerGroup
    {
        public string ticker { get; set; }
        public string interval { get; set; }
        public int NumberofConnections { get; set; }

        public TickerGroup(string ticker, string interval)
        {
            this.ticker = ticker;
            this.interval = interval;
            NumberofConnections = 1;
        }
    }
}