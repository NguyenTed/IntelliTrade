using market_service.Application.Dtos.Stock.Request;

namespace market_service.Application.UseCase.Stock
{
    public interface IStockService
    {
        Task GetHistoricalStockData(HistoricalDataRequestDto request);
    }
}