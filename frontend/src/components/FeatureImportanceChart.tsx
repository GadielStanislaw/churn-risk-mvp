import type { FeatureImportance } from "../types";
import "./FeatureImportanceChart.css";

const BAR_COLOR = "#2a78d6";

function formatFeatureName(feature: string): string {
  return feature.replace(/_/g, " ");
}

interface FeatureImportanceChartProps {
  features: FeatureImportance[];
}

export function FeatureImportanceChart({ features }: FeatureImportanceChartProps) {
  const max = Math.max(...features.map((f) => f.importance), 0.0001);

  return (
    <div className="feature-chart">
      <h2 className="feature-chart__title">Top churn drivers</h2>
      <div className="feature-chart__rows">
        {features.map((f) => {
          const widthPercent = (f.importance / max) * 100;
          return (
            <div className="feature-chart__row" key={f.feature}>
              <span className="feature-chart__label" title={f.feature}>
                {formatFeatureName(f.feature)}
              </span>
              <div className="feature-chart__track">
                <div
                  className="feature-chart__bar"
                  style={{ width: `${widthPercent}%`, backgroundColor: BAR_COLOR }}
                />
              </div>
              <span className="feature-chart__value">{f.importance.toFixed(3)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
