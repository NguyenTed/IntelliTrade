from db.mongo import db
from app.schemas.symbol_schema import SymbolSchema
from typing import List

collection = db["symbols"]

def insert_symbol(symbol: SymbolSchema):
    data = symbol.model_dump(by_alias=True)
    data.pop("_id")
    
    name = data["name"]

    collection.update_one(
        {"name": name},
        {"$set": data},
        upsert=True
    )

def find_symbols_by_keyword(keyword: str) -> List[SymbolSchema]:
    cursor = collection.find({"name": {"$regex": keyword, "$options": "i"}})
    return [SymbolSchema(**doc) for doc in cursor]