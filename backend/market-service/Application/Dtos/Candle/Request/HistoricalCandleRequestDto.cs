using System.ComponentModel.DataAnnotations;

namespace market_service.Application.Dtos.Stock.Request
{
    public sealed class HistoricalDataRequestDto
    {
        public string Symbol { get; set; }
        public string Interval { get; set; }
        public long StartTime { get; set; }
        public long EndTime { get; set; }

    }
}