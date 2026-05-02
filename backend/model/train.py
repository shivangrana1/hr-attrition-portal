import pandas as pd
import numpy as np
import pickle
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.preprocessing import LabelEncoder

df = pd.read_csv("model/WA_Fn-UseC_-HR-Employee-Attrition.csv")

# Drop columns that don't help prediction
df.drop(["EmployeeCount", "EmployeeNumber", "Over18", "StandardHours"], axis=1, inplace=True)

# Encode target
df["Attrition"] = df["Attrition"].map({"Yes": 1, "No": 0})

# Encode all text columns
le = LabelEncoder()
text_cols = df.select_dtypes(include="object").columns
for col in text_cols:
    df[col] = le.fit_transform(df[col])

# Features and target
X = df.drop("Attrition", axis=1)
y = df["Attrition"]

# Save feature names for prediction later
feature_names = list(X.columns)
with open("model/feature_names.pkl", "wb") as f:
    pickle.dump(feature_names, f)

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train XGBoost
model = XGBClassifier(
    n_estimators=200,
    max_depth=4,
    learning_rate=0.05,
    use_label_encoder=False,
    eval_metric="logloss",
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("\nModel Performance:")
print(classification_report(y_test, y_pred))

# Save model
with open("model/model.pkl", "wb") as f:
    pickle.dump(model, f)

print("\nModel saved to model/model.pkl")
print("Feature names saved to model/feature_names.pkl")