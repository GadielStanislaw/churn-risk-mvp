import { useState, type FormEvent } from "react";
import type { ClientFeatures } from "../types";
import "./ClientForm.css";

const DEFAULT_FEATURES: ClientFeatures = {
  gender: "Female",
  senior_citizen: "No",
  partner: "No",
  dependents: "No",
  tenure_months: 12,
  phone_service: "Yes",
  multiple_lines: "No",
  internet_service: "Fiber optic",
  online_security: "No",
  online_backup: "No",
  device_protection: "No",
  tech_support: "No",
  streaming_tv: "No",
  streaming_movies: "No",
  contract: "Month-to-month",
  paperless_billing: "Yes",
  payment_method: "Electronic check",
  monthly_charges: 70,
  total_charges: 840,
};

const INTERNET_DEPENDENT_FIELDS = [
  ["online_security", "Online security"],
  ["online_backup", "Online backup"],
  ["device_protection", "Device protection"],
  ["tech_support", "Tech support"],
  ["streaming_tv", "Streaming TV"],
  ["streaming_movies", "Streaming movies"],
] as const;

const INTERNET_DEPENDENT_OPTIONS = ["No", "No internet service", "Yes"] as const;

interface ClientFormProps {
  onSubmit: (features: ClientFeatures) => void;
  loading: boolean;
}

export function ClientForm({ onSubmit, loading }: ClientFormProps) {
  const [features, setFeatures] = useState<ClientFeatures>(DEFAULT_FEATURES);

  function update<K extends keyof ClientFeatures>(key: K, value: ClientFeatures[K]) {
    setFeatures((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    onSubmit(features);
  }

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      <div className="client-form__grid">
        <label>
          Gender
          <select
            value={features.gender}
            onChange={(e) => update("gender", e.target.value as ClientFeatures["gender"])}
          >
            <option>Female</option>
            <option>Male</option>
          </select>
        </label>

        <label>
          Senior citizen
          <select
            value={features.senior_citizen}
            onChange={(e) =>
              update("senior_citizen", e.target.value as ClientFeatures["senior_citizen"])
            }
          >
            <option>No</option>
            <option>Yes</option>
          </select>
        </label>

        <label>
          Partner
          <select
            value={features.partner}
            onChange={(e) => update("partner", e.target.value as ClientFeatures["partner"])}
          >
            <option>No</option>
            <option>Yes</option>
          </select>
        </label>

        <label>
          Dependents
          <select
            value={features.dependents}
            onChange={(e) => update("dependents", e.target.value as ClientFeatures["dependents"])}
          >
            <option>No</option>
            <option>Yes</option>
          </select>
        </label>

        <label>
          Tenure (months)
          <input
            type="number"
            min={0}
            max={120}
            value={features.tenure_months}
            onChange={(e) => update("tenure_months", Number(e.target.value))}
          />
        </label>

        <label>
          Phone service
          <select
            value={features.phone_service}
            onChange={(e) =>
              update("phone_service", e.target.value as ClientFeatures["phone_service"])
            }
          >
            <option>No</option>
            <option>Yes</option>
          </select>
        </label>

        <label>
          Multiple lines
          <select
            value={features.multiple_lines}
            onChange={(e) =>
              update("multiple_lines", e.target.value as ClientFeatures["multiple_lines"])
            }
          >
            <option>No</option>
            <option>No phone service</option>
            <option>Yes</option>
          </select>
        </label>

        <label>
          Internet service
          <select
            value={features.internet_service}
            onChange={(e) =>
              update("internet_service", e.target.value as ClientFeatures["internet_service"])
            }
          >
            <option>DSL</option>
            <option>Fiber optic</option>
            <option>No</option>
          </select>
        </label>

        {INTERNET_DEPENDENT_FIELDS.map(([key, labelText]) => (
          <label key={key}>
            {labelText}
            <select
              value={features[key]}
              onChange={(e) => update(key, e.target.value as ClientFeatures[typeof key])}
            >
              {INTERNET_DEPENDENT_OPTIONS.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </label>
        ))}

        <label>
          Contract
          <select
            value={features.contract}
            onChange={(e) => update("contract", e.target.value as ClientFeatures["contract"])}
          >
            <option>Month-to-month</option>
            <option>One year</option>
            <option>Two year</option>
          </select>
        </label>

        <label>
          Paperless billing
          <select
            value={features.paperless_billing}
            onChange={(e) =>
              update("paperless_billing", e.target.value as ClientFeatures["paperless_billing"])
            }
          >
            <option>No</option>
            <option>Yes</option>
          </select>
        </label>

        <label>
          Payment method
          <select
            value={features.payment_method}
            onChange={(e) =>
              update("payment_method", e.target.value as ClientFeatures["payment_method"])
            }
          >
            <option>Bank transfer (automatic)</option>
            <option>Credit card (automatic)</option>
            <option>Electronic check</option>
            <option>Mailed check</option>
          </select>
        </label>

        <label>
          Monthly charges ($)
          <input
            type="number"
            min={0}
            step={0.01}
            value={features.monthly_charges}
            onChange={(e) => update("monthly_charges", Number(e.target.value))}
          />
        </label>

        <label>
          Total charges ($)
          <input
            type="number"
            min={0}
            step={0.01}
            value={features.total_charges}
            onChange={(e) => update("total_charges", Number(e.target.value))}
          />
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Scoring…" : "Predict churn risk"}
      </button>
    </form>
  );
}
