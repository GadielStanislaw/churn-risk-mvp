export interface ClientFeatures {
  gender: "Female" | "Male";
  senior_citizen: "No" | "Yes";
  partner: "No" | "Yes";
  dependents: "No" | "Yes";
  tenure_months: number;
  phone_service: "No" | "Yes";
  multiple_lines: "No" | "No phone service" | "Yes";
  internet_service: "DSL" | "Fiber optic" | "No";
  online_security: "No" | "No internet service" | "Yes";
  online_backup: "No" | "No internet service" | "Yes";
  device_protection: "No" | "No internet service" | "Yes";
  tech_support: "No" | "No internet service" | "Yes";
  streaming_tv: "No" | "No internet service" | "Yes";
  streaming_movies: "No" | "No internet service" | "Yes";
  contract: "Month-to-month" | "One year" | "Two year";
  paperless_billing: "No" | "Yes";
  payment_method:
    | "Bank transfer (automatic)"
    | "Credit card (automatic)"
    | "Electronic check"
    | "Mailed check";
  monthly_charges: number;
  total_charges: number;
}

export type RiskLabel = "low" | "medium" | "high";

export interface PredictionResponse {
  churn_probability: number;
  risk_label: RiskLabel;
  model_name: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
}

export interface PortfolioSummary {
  total_clients: number;
  risk_counts: Record<RiskLabel, number>;
  average_churn_probability: number;
  top_features: FeatureImportance[];
}

export interface RocPoint {
  fpr: number;
  tpr: number;
  threshold: number | null;
}

export interface ConfusionMatrix {
  true_negative: number;
  false_positive: number;
  false_negative: number;
  true_positive: number;
}

export interface ModelEvaluation {
  roc_auc: number;
  precision: number;
  recall: number;
  f1: number;
  roc_curve: RocPoint[];
  confusion_matrix: ConfusionMatrix;
}
