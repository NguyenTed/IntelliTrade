public class TickerJointStock
{
  public string Symbol { get; set; }
  public string Interval { get; set; }

  public TickerJointStock(string ticker, string interval)
  {
    this.Symbol = ticker;
    this.Interval = interval;
  }
}