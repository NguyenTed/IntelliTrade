# 📈 Stocks Realtime SignalR Server

This is a **SignalR-based WebSocket server** built with ASP.NET Core for broadcasting real-time stock price updates to connected clients (e.g., frontend apps).

---

## 🚀 Overview

Clients can connect to this hub to subscribe to specific stock symbols and intervals (e.g., `BTCUSDT` at `1m`). Once subscribed, they will receive real-time candlestick data (`OHLCV`) via SignalR pushes.

The server manages subscriptions and group memberships internally, using a `TickerManager` to track active subscriptions and minimize redundant data fetching.

---

## 📡 Hub: `StocksFeedHub`

Namespace: `Stocks.Realtime.Api.Realtime`

The SignalR hub that handles:
- Clients joining or leaving stock groups.
- Tracking client connections and subscriptions.
- Notifying `TickerManager` about active tickers.

### 🔌 Public Methods

#### `JoinStockGroup(string ticker, string interval = "1m")`

Adds the client to a group named as `<ticker>:<interval>`, e.g., `btcusdt:1m`.

- **ticker**: required (e.g., `"BTCUSDT"`)
- **interval**: optional (`"1m"`, `"5m"`, etc.)

✅ The server adds the client to a SignalR group and starts tracking that ticker/interval combo.

---

#### `LeaveStockGroup(string ticker, string interval = "1m")`

Removes the client from a specific group.

✅ Also updates `TickerManager` to potentially stop tracking that ticker if no other clients are subscribed.

---

#### `OnDisconnectedAsync()`

When a client disconnects:
- Removes it from all groups it had joined.
- Informs `TickerManager` that those subscriptions are no longer needed.

* note : it can be automatically called when user turn off the connection or the page.
---

## 🧠 Server-Side Interface: `IStockUpdateClient`

Namespace: `Stocks.Realtime`

This interface is used by the server to **send stock data to the client automatically**.

```csharp
public interface IStockUpdateClient
{
    Task ReceiveStockPriceUpdate(StockPriceUpdate update);
}


## 🧾 Stock Price Data Format: `StockPriceUpdate`


```csharp
public class StockPriceUpdate
{
    public string Symbol { get; set; }        // e.g., "BTCUSDT"
    public string Interval { get; set; }      // e.g., "1m", "5m"
    public decimal Open { get; set; }
    public decimal High { get; set; }
    public decimal Low { get; set; }
    public decimal Close { get; set; }
    public decimal Volume { get; set; }
    public DateTime Time { get; set; }        // Time of the candle
    public bool IsFinal { get; set; } = false; // true if candle is closed
}
```

Clients receive this payload in real-time through the ReceiveStockPriceUpdate() method.

## 🧪 Example Flow (Client-Side)

### JavaScript (SignalR Client)

```js
const connection = new signalR.HubConnectionBuilder()
  .withUrl("/stocksFeedHub")
  .build();

await connection.start();

// Subscribe to a symbol with interval
connection.invoke("JoinStockGroup", "BTCUSDT", "1m");

// Receive stock price updates
connection.on("ReceiveStockPriceUpdate", (data) => {
  console.log("Received update:", data);
});

// Later: Unsubscribe
connection.invoke("LeaveStockGroup", "BTCUSDT", "1m");
