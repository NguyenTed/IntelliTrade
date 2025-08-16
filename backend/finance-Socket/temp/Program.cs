using Microsoft.AspNetCore.SignalR.Client;

class Program
{
    static async Task Main(string[] args)
    {
        var connection = new HubConnectionBuilder()
            .WithUrl("http://localhost:5088/stocks-feed")
            .WithAutomaticReconnect()
            .Build();

        connection.On<string, string>("ReceiveStockUpdate", (ticker, interval) =>
        {
            Console.WriteLine($"Update for {ticker} - {interval}");
        });

        await connection.StartAsync();
        Console.WriteLine("Connected to StocksFeedHub");

        // Gọi JoinStockGroup
        string ticker = "BTC";
        string interval = "1m";
        await connection.InvokeAsync("JoinStockGroup", ticker, interval);
        Console.WriteLine($"Joined group {ticker}:{interval}");

        Console.WriteLine("Press any key to exit...");
        Console.ReadKey();

        // Gọi LeaveStockGroup trước khi disconnect
        await connection.InvokeAsync("LeaveStockGroup", ticker, interval);

        await connection.StopAsync();
    }
}
