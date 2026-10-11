import type { RiskLabel } from "../types";
import "./RiskDistributionChart.css";

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

const ORDER: RiskLabel[] = ["low", "medium", "high"];

interface RiskDistributionChartProps {
  counts: Record<RiskLabel, number>;
}

export function RiskDistributionChart({ counts }: RiskDistributionChartProps) {
  const max = Math.max(...ORDER.map((label) => counts[label]), 1);

  return (
    <div className="risk-dist">
      <h2 className="risk-dist__title">Client risk distribution</h2>
      <div className="risk-dist__rows">
        {ORDER.map((label) => {
          const value = counts[label];
          const widthPercent = (value / max) * 100;
          return (
            <div className="risk-dist__row" key={label}>
              <span className="risk-dist__label">{STATUS_TEXT[label]}</span>
              <div className="risk-dist__track">
                <div
                  className="risk-dist__bar"
                  style={{ width: `${widthPercent}%`, backgroundColor: STATUS_COLOR[label] }}
                />
              </div>
              <span className="risk-dist__value">{value.toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
