import type { RiskLabel } from "../types";
import "./RiskMeter.css";

const STATUS_COLOR: Record<RiskLabel, string> = {
  low: "#0ca30c",
  medium: "#fab219",
  high: "#d03b3b",
};

const STATUS_TEXT: Record<RiskLabel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

interface RiskMeterProps {
  probability: number;
  riskLabel: RiskLabel;
}

export function RiskMeter({ probability, riskLabel }: RiskMeterProps) {
  const percent = Math.round(probability * 100);
  const color = STATUS_COLOR[riskLabel];

  return (
    <div
      className="risk-meter"
      title={`${percent}% churn probability — ${STATUS_TEXT[riskLabel]}`}
    >
      <div className="risk-meter__header">
        <span
          className="risk-meter__dot"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <span className="risk-meter__label">{STATUS_TEXT[riskLabel]}</span>
        <span className="risk-meter__value">{percent}%</span>
      </div>
      <div
        className="risk-meter__track"
        style={{ backgroundColor: `${color}26` }}
        role="meter"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Churn probability"
      >
        <div
          className="risk-meter__fill"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
