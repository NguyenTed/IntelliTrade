using FluentValidation;
using market_service.Application.Dtos.Stock.Request;

public class HistoricalDataRequestValidator : AbstractValidator<HistoricalDataRequestDto>
{
    public HistoricalDataRequestValidator()
    {
        RuleFor(x => x.Symbol)
            .NotEmpty();

        RuleFor(x => x.Interval)
            .Must(BeAValidInterval)
            .WithMessage("Interval must be one of: 1m, 3m, 5m, 15m, 1h, 1d");

        RuleFor(x => x.StartTime)
        .GreaterThan(0).WithMessage("StartTime must be positive.");

        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime).WithMessage("EndTime must be greater than StartTime.");

        RuleFor(x => x.StartTime)
            .NotEmpty();

        RuleFor(x => x.EndTime)
            .NotEmpty();

    }

    private bool BeAValidInterval(string interval)
    {
        var valid = new[] { "1m", "3m", "5m", "15m", "30m", "1h", "2h", "4h", "6h", "8h", "12h", "1d", "3d", "1w", "1M"};
        return valid.Contains(interval);
    }
}
