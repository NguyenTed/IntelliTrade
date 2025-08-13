from flask import Flask, jsonify, Blueprint, request
from app.services.symbol_service import SymbolService


symbol_bp = Blueprint("symbol", __name__)

@symbol_bp.route("/crawler/symbol/search", methods=["GET"])
def search_symbol():
    keyword = request.args.get("keyword", "")
    symbols = SymbolService.find_symbols_by_keyword(keyword)
    return jsonify([symbol.model_dump() for symbol in symbols])
