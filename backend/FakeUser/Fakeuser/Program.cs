using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR.Client;

class Program
{
    static async Task Main(string[] args)
    {
        var hubUrl = "http://localhost:6001/stocks-feed/"; // chú ý dấu / cuối
        var connection = new HubConnectionBuilder()
            .WithUrl(hubUrl)
            .WithAutomaticReconnect()
            .Build();

        connection.On<StockPriceUpdate>("ReceiveStockPriceUpdate", update =>
        {
            Console.WriteLine($"[{update.Time:HH:mm:ss}] {update.Symbol} ({update.Interval}) " +
                              $"O:{update.Open} H:{update.High} L:{update.Low} C:{update.Close} " +
                              $"V:{update.Volume} Final:{update.IsFinal}");
        });

        try
        {
            await connection.StartAsync();
            Console.WriteLine("Connected to hub!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Connection failed: {ex.Message}");
            return;
        }

        while (true)
        {
            Console.Write("Enter symbol (or 'exit' to quit): ");
            string symbol = Console.ReadLine()?.Trim();
            if (string.IsNullOrEmpty(symbol) || symbol.Equals("exit", StringComparison.OrdinalIgnoreCase))
                break;

            Console.Write("Enter interval: ");
            string interval = Console.ReadLine()?.Trim();
            if (string.IsNullOrEmpty(interval) || interval.Equals("exit", StringComparison.OrdinalIgnoreCase))
                break;

            try
            {
                await connection.InvokeAsync("JoinStockGroup", symbol, interval);
                Console.WriteLine($"Joined group {symbol} ({interval})");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to join group: {ex.Message}");
            }
        }

        await connection.StopAsync();
        Console.WriteLine("Disconnected. Bye!");
    }
}

// Mirror class từ server
public class StockPriceUpdate
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
