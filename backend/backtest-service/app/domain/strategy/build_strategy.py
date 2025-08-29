import re
from typing import Dict, List, Tuple
from backtesting import Strategy
import numpy as np

from app.domain.method import Method
from app.dto.request.Side import Side
from app.dto.request.StrategyConfigDTO import StrategyConfigDTO
from app.factory.IndicatorFactory import IndicatorFactory
from app.factory.MethodFactory import MethodFactory

def build_strategy(cfg: StrategyConfigDTO):
    class DynamicStrategy(Strategy):
        def init(self):
            self._rules: Dict[str, Tuple[Method, str, str]] = {}
            self._buy_rule_ids: List[str] = self._extract_rule_ids(cfg.buyCondition)
            self._sell_rule_ids: List[str] = self._extract_rule_ids(cfg.sellCondition)

            
            def get_attr_name(side: Side) -> str:
                if side.type == "CONST":
                    return f"CONST_{str(side.const).replace('.', '_')}"
                return f"{side.type}_{side.window}"

            
            def ensure_indicator_attribute(side: Side) -> str:
                attr_name = get_attr_name(side)
                if not hasattr(self, attr_name):
                    if side.type == "CONST":
                        setattr(self, attr_name, np.full(len(self.data.Close), side.const))
                    else:
                        ind = IndicatorFactory.create(side.type, side.window)
                        fn, args = ind.bt_callable()
                        indicator_proxy = self.I(fn, self.data.Close, *args)
                        setattr(self, attr_name, indicator_proxy)
                return attr_name

            cnt = 0
            for rule in cfg.rules:
                lk_attr = ensure_indicator_attribute(rule.left)
                rk_attr = ensure_indicator_attribute(rule.right)
                method = MethodFactory.create(rule.op)
                self._rules[f"s{cnt}"] = (method, lk_attr, rk_attr)
                cnt += 1

            self._buy_rule_ids  = self._extract_rule_ids(cfg.buyCondition)
            self._sell_rule_ids = self._extract_rule_ids(cfg.sellCondition)
        def _has_nan_for_rules(self, rule_ids):
            for rid in rule_ids:
                method, lk_key, rk_key = self._rules[rid]
                lk_val = getattr(self, lk_key)[-1]
                rk_val = getattr(self, rk_key)[-1]
                if not np.isfinite(lk_val) or not np.isfinite(rk_val):
                    return True
            return False
        def _extract_rule_ids(self, expr: str) -> List[str]:
            return sorted(set(re.findall(r"\bs\d+\b", expr or "")))

        def _eval_rule(self, rid: str) -> bool:
            method, lk_attr, rk_attr = self._rules[rid]
            a = getattr(self, lk_attr)
            b = getattr(self, rk_attr)
            return bool(method.compare(a, b))
        
        def _eval_expr_bool(self, expr: str) -> bool:
            if not re.fullmatch(r"[()\s!&|s\d]+", expr or ""):
                raise ValueError("Invalid characters in logical expression")
            expr_py = (
                (expr or "")
                .replace("&", " and ")
                .replace("|", " or ")
                .replace("!", " not ")
            )
            def repl(m):
                return str(self._eval_rule(m.group(0)))
            expr_py = re.sub(r"\bs\d+\b", repl, expr_py)
            return bool(eval(expr_py, {"__builtins__": None}, {}))

        def next(self):
            long_entry = False
            short_entry = False

            buy_ready = not self._has_nan_for_rules(self._buy_rule_ids)
            if buy_ready:
                long_entry = self._eval_expr_bool(cfg.buyCondition)

            sell_ready = not self._has_nan_for_rules(self._sell_rule_ids)
            if sell_ready:
                short_entry = self._eval_expr_bool(cfg.sellCondition)

            price = self.data.Close[-1]
            
            if not self.position:
                if long_entry:
                    self.buy(sl=price*(1 - cfg.slPct), tp=price*(1 + cfg.tpPct))
                elif short_entry:
                    self.sell(sl=price*(1 + cfg.slPct), tp=price*(1 - cfg.tpPct))
                return

            if self.position.is_long and short_entry:
                self.position.close()
                self.sell(sl=price*(1 + cfg.slPct), tp=price*(1 - cfg.tpPct))

            elif self.position.is_short and long_entry:
                self.position.close()
                self.buy(sl=price*(1 - cfg.slPct), tp=price*(1 + cfg.tpPct))

    return DynamicStrategy
