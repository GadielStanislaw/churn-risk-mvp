from typing import Literal

from pydantic import BaseModel, Field


class ClientFeatures(BaseModel):
    gender: Literal["Female", "Male"]
    senior_citizen: Literal["No", "Yes"]
    partner: Literal["No", "Yes"]
    dependents: Literal["No", "Yes"]
    tenure_months: int = Field(ge=0, le=120)
    phone_service: Literal["No", "Yes"]
    multiple_lines: Literal["No", "No phone service", "Yes"]
    internet_service: Literal["DSL", "Fiber optic", "No"]
    online_security: Literal["No", "No internet service", "Yes"]
    online_backup: Literal["No", "No internet service", "Yes"]
    device_protection: Literal["No", "No internet service", "Yes"]
    tech_support: Literal["No", "No internet service", "Yes"]
    streaming_tv: Literal["No", "No internet service", "Yes"]
    streaming_movies: Literal["No", "No internet service", "Yes"]
    contract: Literal["Month-to-month", "One year", "Two year"]
    paperless_billing: Literal["No", "Yes"]
    payment_method: Literal[
        "Bank transfer (automatic)",
        "Credit card (automatic)",
        "Electronic check",
        "Mailed check",
    ]
    monthly_charges: float = Field(ge=0)
    total_charges: float = Field(ge=0)


class PredictionResponse(BaseModel):
    churn_probability: float
    risk_label: Literal["low", "medium", "high"]
    model_name: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class FeatureImportance(BaseModel):
    feature: str
    importance: float


class RiskCounts(BaseModel):
    low: int
    medium: int
    high: int


class PortfolioSummary(BaseModel):
    total_clients: int
    risk_counts: RiskCounts
    average_churn_probability: float
    top_features: list[FeatureImportance]


class RocPoint(BaseModel):
    fpr: float
    tpr: float
    threshold: float | None


class ConfusionMatrix(BaseModel):
    true_negative: int
    false_positive: int
    false_negative: int
    true_positive: int


class ModelEvaluation(BaseModel):
    roc_auc: float
    precision: float
    recall: float
    f1: float
    roc_curve: list[RocPoint]
    confusion_matrix: ConfusionMatrix
