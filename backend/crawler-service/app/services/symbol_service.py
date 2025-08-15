
from app.responses.symbol_response import SymbolResponse
from db.models.symbol_model import find_symbols_by_keyword

class SymbolService:
    @staticmethod
    def find_symbols_by_keyword(keyword: str):
        keyword = keyword.strip('"')
        symbols = find_symbols_by_keyword(keyword)
        symbol_responses = []
        for symbol in symbols:
            symbol_responses.append(SymbolResponse(
                id=str(symbol.id),
                name=symbol.name,
                source=symbol.source
            ))
        return symbol_responses

    