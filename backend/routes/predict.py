import json
import io
import numpy as np
import pandas as pd
import shap
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sqlalchemy.orm import Session
from xgboost import XGBClassifier

from database import Employee, get_db

router = APIRouter()


def get_risk_label(prob: float) -> str:
    if prob >= 0.6:
        return "High"
    elif prob >= 0.35:
        return "Medium"
    return "Low"


@router.post("/detect-columns")
async def detect_columns(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        columns = list(df.columns)

        likely_target = None
        for col in columns:
            if any(k in col.lower() for k in ["attrit", "left", "churn", "resign", "quit", "turnover", "target"]):
                likely_target = col
                break
        if not likely_target:
            for col in columns:
                unique_vals = set(str(v).lower() for v in df[col].dropna().unique())
                if unique_vals <= {"0", "1", "yes", "no", "true", "false"}:
                    likely_target = col
                    break
        if not likely_target:
            likely_target = columns[-1]

        likely_name = None
        for col in columns:
            if any(k in col.lower() for k in ["name", "id", "employee", "emp", "enrollee", "number"]):
                likely_name = col
                break
        if not likely_name:
            likely_name = columns[0]

        likely_dept = None
        for col in columns:
            if any(k in col.lower() for k in ["dept", "department", "division", "team", "city", "role"]):
                likely_dept = col
                break
        if not likely_dept:
            likely_dept = columns[1]

        sample_values = {
            col: df[col].dropna().unique()[:5].tolist()
            for col in columns[:10]
        }

        return {
            "columns": columns,
            "likely_target": likely_target,
            "likely_name": likely_name,
            "likely_dept": likely_dept,
            "sample_values": sample_values,
        }
    except Exception as e:
        return {"error": str(e)}


@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    target_col: str = Form(...),
    name_col: str = Form(...),
    dept_col: str = Form(...),
    db: Session = Depends(get_db),
):
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

        if target_col not in df.columns:
            return {"error": f"Target column '{target_col}' not found in CSV"}

        target = df[target_col].copy()
        unique_vals = target.dropna().unique()
        str_vals = set(str(v).lower() for v in unique_vals)

        if str_vals <= {"yes", "no"}:
            target = target.map(lambda x: 1 if str(x).lower() == "yes" else 0)
        elif str_vals <= {"true", "false"}:
            target = target.map(lambda x: 1 if str(x).lower() == "true" else 0)
        else:
            target = pd.to_numeric(target, errors="coerce").fillna(0).astype(int)

        if target.nunique() > 2:
            return {
                "error": f"Column '{target_col}' has {target.nunique()} unique values. "
                         f"Please select a binary column (Yes/No or 0/1) as the target."
            }

        drop_cols = list({target_col, name_col, dept_col})
        feature_df = df.drop(columns=drop_cols, errors="ignore").copy()

        le = LabelEncoder()
        for col in feature_df.select_dtypes(include="object").columns:
            feature_df[col] = le.fit_transform(feature_df[col].astype(str))

        feature_df = feature_df.fillna(0)
        feature_names = list(feature_df.columns)

        X_train, X_test, y_train, y_test = train_test_split(
            feature_df, target, test_size=0.2, random_state=42
        )

        model = XGBClassifier(
            n_estimators=100,
            max_depth=4,
            learning_rate=0.1,
            use_label_encoder=False,
            eval_metric="logloss",
            random_state=42,
        )
        model.fit(X_train, y_train)

        y_pred = model.predict(X_test)
        metrics = {
            "accuracy":  round(float(accuracy_score(y_test, y_pred)) * 100, 1),
            "precision": round(float(precision_score(y_test, y_pred, zero_division=0)) * 100, 1),
            "recall":    round(float(recall_score(y_test, y_pred, zero_division=0)) * 100, 1),
            "f1":        round(float(f1_score(y_test, y_pred, zero_division=0)) * 100, 1),
        }
        with open("model/metrics.json", "w") as f:
            json.dump(metrics, f)

        probs = model.predict_proba(feature_df)[:, 1]

        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(feature_df)
        sv = shap_values[1] if isinstance(shap_values, list) else shap_values

        mean_shap = np.abs(sv).mean(axis=0)
        top_indices = np.argsort(mean_shap)[-5:][::-1]
        global_shap = [
            {"feature": feature_names[j], "value": round(float(mean_shap[j]), 4)}
            for j in top_indices
        ]

        with open("model/global_shap.json", "w") as f:
            json.dump(global_shap, f)

        db.query(Employee).delete()
        results = []

        for i, row in df.iterrows():
            prob = float(probs[i])
            label = get_risk_label(prob)

            emp = Employee(
                name=f"EMP-{i + 1}",
                department=str(row.get(dept_col, "Unknown")),
                age=int(row.get("Age", 0)) if "Age" in df.columns else 0,
                years_at_company=float(row.get("YearsAtCompany", row.get("Tenure", 0)))
                if any(c in df.columns for c in ["YearsAtCompany", "Tenure"]) else 0,
                monthly_income=float(row.get("MonthlyIncome", row.get("Salary", 0)))
                if any(c in df.columns for c in ["MonthlyIncome", "Salary"]) else 0,
                job_satisfaction=int(row.get("JobSatisfaction", row.get("Satisfaction", 0)))
                if any(c in df.columns for c in ["JobSatisfaction", "Satisfaction"]) else 0,
                attrition_risk=round(prob, 4),
                risk_label=label,
            )
            db.add(emp)
            results.append({
                "employee": i + 1,
                "attrition_risk": round(prob, 4),
                "risk_label": label,
            })

        db.commit()
        return {
            "total": len(results),
            "metrics": metrics,
            "global_shap": global_shap,
            "predictions": results[:10],
        }

    except Exception as e:
        return {"error": str(e)}


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    employees = db.query(Employee).all()
    total = len(employees)
    high   = sum(1 for e in employees if e.risk_label == "High")
    medium = sum(1 for e in employees if e.risk_label == "Medium")
    low    = sum(1 for e in employees if e.risk_label == "Low")
    return {"total": total, "high_risk": high, "medium_risk": medium, "low_risk": low}


@router.get("/shap")
def get_shap():
    try:
        with open("model/global_shap.json", "r") as f:
            return json.load(f)
    except Exception:
        return []


@router.get("/metrics")
def get_metrics():
    try:
        with open("model/metrics.json", "r") as f:
            return json.load(f)
    except Exception:
        return {"accuracy": 0, "precision": 0, "recall": 0, "f1": 0}