from flask import Blueprint, jsonify, request

from app.domain.strategy.build_strategy import build_strategy
from app.dto.request import StrategyConfigDTO
from app.mapper.JsonToStratefyConfig import parse_strategy_config
from app.service.backtest_service import run_backtest_strategy

backtest_controller = Blueprint('backtest', __name__)

@backtest_controller.route('/')
def index():
    return "Hello, Backtest!"

@backtest_controller.route('/backtest/api/v1/run', methods=['POST'])
def run_backtest():
    try:
        json_data = request.get_json()
        print(f"Received JSON data: {json_data}")
        cfg = parse_strategy_config(json_data)
        res = run_backtest_strategy(cfg)
        return jsonify(res), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500