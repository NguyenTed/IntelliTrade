from db.mongo import db
from typing import List
from app.schemas.labeled_data_schema import LabeledDataSchema

collection = db["labeled_datas"]

def insert_labeled_datas(labeled_datas: List[LabeledDataSchema]):
    for labeled_data in labeled_datas:
        data = labeled_data.model_dump(by_alias=True)
        data.pop("_id")

        collection.insert_one(data)

def find_all_labeled_datas() -> List[LabeledDataSchema]:
    cursor = db["labeled_datas"].find()
    return [LabeledDataSchema(**doc) for doc in cursor]