namespace Stocks.Realtime;

public class StockPriceUpdate()
{
    public string symbol { get; set; }
    public float open { get; set; }
    public float high { get; set; }
    public float low { get; set; }
    public float close { get; set; }
    public float volume { get; set; }
    public DateTime timestamp { get; set; }
    public bool isFinal { get; set; } = false;
}
