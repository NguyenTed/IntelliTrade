namespace finance_Socket.Realtime.shared
{
    public sealed class TickerGroup
    {
        public string ticker { get; set; }
        public int NumberofConnections { get; set; }

        public TickerGroup(string ticker)
        {
            this.ticker = ticker;
            NumberofConnections = 1;
        }
    }
}