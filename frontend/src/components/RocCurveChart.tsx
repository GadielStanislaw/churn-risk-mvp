import { useRef, useState, type MouseEvent } from "react";
import type { RocPoint } from "../types";
import "./RocCurveChart.css";

const WIDTH = 320;
const HEIGHT = 320;
const MARGIN = { top: 16, right: 16, bottom: 36, left: 44 };
const PLOT_WIDTH = WIDTH - MARGIN.left - MARGIN.right;
const PLOT_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom;
const LINE_COLOR = "#2a78d6";
const TICKS = [0, 0.5, 1];

function toX(fpr: number) {
  return MARGIN.left + fpr * PLOT_WIDTH;
}

function toY(tpr: number) {
  return MARGIN.top + (1 - tpr) * PLOT_HEIGHT;
}

function nearestPoint(points: RocPoint[], fpr: number): number {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < points.length; i++) {
    const dist = Math.abs(points[i].fpr - fpr);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

interface RocCurveChartProps {
  points: RocPoint[];
  auc: number;
}

export function RocCurveChart({ points, auc }: RocCurveChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"}${toX(p.fpr)},${toY(p.tpr)}`).join(" ");

  function handleMouseMove(event: MouseEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const offsetX = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const fpr = Math.min(1, Math.max(0, (offsetX - MARGIN.left) / PLOT_WIDTH));
    setHoverIndex(nearestPoint(points, fpr));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="roc-chart">
      <h2 className="roc-chart__title">ROC curve</h2>
      <div className="roc-chart__svg-wrap">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="roc-chart__svg"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {TICKS.map((t) => (
            <line
              key={`grid-x-${t}`}
              x1={MARGIN.left}
              x2={WIDTH - MARGIN.right}
              y1={toY(t)}
              y2={toY(t)}
              className="roc-chart__gridline"
            />
          ))}
          {TICKS.map((t) => (
            <text key={`label-y-${t}`} x={MARGIN.left - 8} y={toY(t)} className="roc-chart__tick" textAnchor="end" dominantBaseline="middle">
              {t}
            </text>
          ))}
          {TICKS.map((t) => (
            <text
              key={`label-x-${t}`}
              x={toX(t)}
              y={HEIGHT - MARGIN.bottom + 18}
              className="roc-chart__tick"
              textAnchor="middle"
            >
              {t}
            </text>
          ))}

          <line
            x1={toX(0)}
            y1={toY(0)}
            x2={toX(1)}
            y2={toY(1)}
            className="roc-chart__baseline"
          />

          <path d={pathD} className="roc-chart__line" style={{ stroke: LINE_COLOR }} />

          {hovered && (
            <>
              <line
                x1={toX(hovered.fpr)}
                x2={toX(hovered.fpr)}
                y1={MARGIN.top}
                y2={HEIGHT - MARGIN.bottom}
                className="roc-chart__crosshair"
              />
              <circle
                cx={toX(hovered.fpr)}
                cy={toY(hovered.tpr)}
                r={5}
                className="roc-chart__dot"
                style={{ fill: LINE_COLOR }}
              />
            </>
          )}

          <text x={WIDTH - MARGIN.right} y={MARGIN.top + 14} textAnchor="end" className="roc-chart__auc">
            AUC {auc.toFixed(3)}
          </text>
        </svg>

        {hovered && (
          <div className="roc-chart__tooltip">
            <div>FPR {hovered.fpr.toFixed(3)}</div>
            <div>TPR {hovered.tpr.toFixed(3)}</div>
            {hovered.threshold !== null && <div>Threshold {hovered.threshold.toFixed(3)}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
