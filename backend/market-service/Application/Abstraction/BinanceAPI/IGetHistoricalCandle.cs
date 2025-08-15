using market_service.Application.Dtos.Candle;

namespace market_service.Application.Abstraction.BinanceAPI
{
    public interface IGetHistoricalCandle
    {
        Task<List<Candle>> GetHistoricalCandlesAsync(
           string symbol,
           string interval,
           long startTime,
           long endTime);
    }
}