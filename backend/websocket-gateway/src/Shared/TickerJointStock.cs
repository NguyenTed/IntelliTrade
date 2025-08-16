public class TickerJointStock
{
  public string ticker { get; set; }
  public string interval { get; set; }

  public TickerJointStock(string ticker, string interval)
  {
    this.ticker = ticker;
    this.interval = interval;
  }
}