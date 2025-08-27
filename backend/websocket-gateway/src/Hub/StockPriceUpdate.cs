namespace websocket.gateway.Hub;

public class StockPriceUpdate()
{
    public string Symbol { get; set; }
    public string Interval { get; set; }
    public decimal Open { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Close { get; set; }
    public decimal Volume { get; set; }
    public DateTime Time { get; set; }
    public bool IsFinal { get; set; } = false;
}
