from db.mongo import db
from pymongo import ReturnDocument
from app.schemas.symbol_schema import SymbolSchema
from typing import List
from bson import ObjectId

collection = db["symbols"]

def insert_symbol(symbol: SymbolSchema):
    data = symbol.model_dump(by_alias=True)
    data.pop("_id", None) 

    name = data["name"]

    updated_doc = collection.find_one_and_update(
        {"name": name},
        {"$set": data},
        upsert=True,
        return_document=ReturnDocument.AFTER
    )

    return updated_doc["_id"]

def find_symbols_by_keyword(keyword: str) -> List[SymbolSchema]:
    cursor = collection.find({"name": {"$regex": keyword, "$options": "i"}})
    return [SymbolSchema(**doc) for doc in cursor]

def find_symbols_by_name(name: str) -> SymbolSchema:
    cursor = collection.find_one({"name": name})
    return SymbolSchema(**cursor) if cursor else None
    
def find_symbol_by_id(symbol_id: str) -> SymbolSchema:
    cursor = collection.find_one({"_id": ObjectId(symbol_id)})
    return SymbolSchema(**cursor) if cursor else None