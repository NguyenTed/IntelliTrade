import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import classification_report
import joblib
import os

from db.models.labeled_data_model import find_all_labeled_datas
from app.schemas.labeled_data_schema import LabeledDataSchema

class TrainModel:
    def load_data_from_db(self) -> pd.DataFrame:
        labeled_data: list[LabeledDataSchema] = find_all_labeled_datas()
        records = []

        for item in labeled_data:
            records.append({
                "tag": item.tag,
                "class": item.className,
                "source": item.source,
                "depth": item.depth,
                "text_length": item.textLength,
                "has_img": int(item.hasImg),
                "label": item.label
            })

        return pd.DataFrame(records)

    def train_general_model(self):
        df = self.load_data_from_db()

        X = df[["tag", "class", "source", "depth", "text_length", "has_img"]]
        y = df["label"]

        encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
        X_encoded = encoder.fit_transform(X[["tag", "class", "source"]])
        X_numeric = X[["depth", "text_length", "has_img"]].values
        X_final = np.concatenate([X_encoded, X_numeric], axis=1)

        X_train, X_test, y_train, y_test = train_test_split(
            X_final, y, test_size=0.2, random_state=42
        )

        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        print("=== Evaluation ===")
        print(classification_report(y_test, y_pred))

        os.makedirs("model", exist_ok=True)
        joblib.dump((model, encoder), "model/general_model.pkl")
        print("✅ Saved general model to model/general_model.pkl")


if __name__ == "__main__":
    TrainModel().train_general_model()
