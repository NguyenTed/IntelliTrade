from app.dto.request.RuleDTO import RuleDTO
from app.dto.request.RuleDTO import RuleDTO
from app.dto.request.Side import Side
from app.dto.request.StrategyConfigDTO import StrategyConfigDTO


def parse_strategy_config(dto: dict) -> StrategyConfigDTO:
    from dateutil import parser

    def parse_side(side: dict) -> Side:
        return Side(
            type=side["type"],
            window=side.get("window"),
            const=side.get("const")
        )

    rules = [
        RuleDTO(
            left=parse_side(r["left"]),
            op=r["op"],
            right=parse_side(r["right"])
        )
        for r in dto["rules"]
    ]

    return StrategyConfigDTO(
        symbol=dto["symbol"],
        interval=dto["interval"],
        startTime=parser.parse(dto["startTime"]) if dto.get("startTime") else None,
        endTime=parser.parse(dto["endTime"]) if dto.get("endTime") else None,
        lots=dto["lots"],
        slPct=dto["slPct"],
        tpPct=dto["tpPct"],
        rules=rules,
        buyCondition=dto["buyCondition"],
        sellCondition=dto["sellCondition"]
    )