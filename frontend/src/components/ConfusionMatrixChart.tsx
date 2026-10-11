import type { ConfusionMatrix } from "../types";
import "./ConfusionMatrixChart.css";

const BAR_COLOR_RGB = "42, 120, 214"; // #2a78d6

interface Cell {
  label: string;
  value: number;
}

function cellStyle(value: number, max: number) {
  const intensity = max === 0 ? 0 : value / max;
  const alpha = 0.12 + intensity * 0.68;
  const useWhiteText = intensity > 0.55;
  return {
    backgroundColor: `rgba(${BAR_COLOR_RGB}, ${alpha})`,
    color: useWhiteText ? "#ffffff" : "var(--text-primary)",
  };
}

interface ConfusionMatrixChartProps {
  matrix: ConfusionMatrix;
}

export function ConfusionMatrixChart({ matrix }: ConfusionMatrixChartProps) {
  const cells: Cell[][] = [
    [
      { label: "True negative", value: matrix.true_negative },
      { label: "False positive", value: matrix.false_positive },
    ],
    [
      { label: "False negative", value: matrix.false_negative },
      { label: "True positive", value: matrix.true_positive },
    ],
  ];
  const max = Math.max(
    matrix.true_negative,
    matrix.false_positive,
    matrix.false_negative,
    matrix.true_positive,
  );

  return (
    <div className="confusion-matrix">
      <h2 className="confusion-matrix__title">Confusion matrix</h2>
      <div className="confusion-matrix__grid">
        <div />
        <div className="confusion-matrix__col-header">Predicted: stays</div>
        <div className="confusion-matrix__col-header">Predicted: churns</div>

        <div className="confusion-matrix__row-header">Actual: stays</div>
        {cells[0].map((cell) => (
          <div key={cell.label} className="confusion-matrix__cell" style={cellStyle(cell.value, max)} title={cell.label}>
            <span className="confusion-matrix__value">{cell.value.toLocaleString()}</span>
          </div>
        ))}

        <div className="confusion-matrix__row-header">Actual: churns</div>
        {cells[1].map((cell) => (
          <div key={cell.label} className="confusion-matrix__cell" style={cellStyle(cell.value, max)} title={cell.label}>
            <span className="confusion-matrix__value">{cell.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
