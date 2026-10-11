import { useEffect, useState } from "react";
import { ClientForm } from "./components/ClientForm";
import { ConfusionMatrixChart } from "./components/ConfusionMatrixChart";
import { FeatureImportanceChart } from "./components/FeatureImportanceChart";
import { LoginForm } from "./components/LoginForm";
import { RiskDistributionChart } from "./components/RiskDistributionChart";
import { RiskMeter } from "./components/RiskMeter";
import { RocCurveChart } from "./components/RocCurveChart";
import { getModelEvaluation, getPortfolioSummary, login, predictChurn } from "./api";
import type {
  ClientFeatures,
  ModelEvaluation,
  PortfolioSummary,
  PredictionResponse,
} from "./types";
import "./App.css";

function App() {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem("access_token"),
  );
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictError, setPredictError] = useState<string | null>(null);

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [evaluation, setEvaluation] = useState<ModelEvaluation | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([getPortfolioSummary(token), getModelEvaluation(token)])
      .then(([portfolioData, evaluationData]) => {
        setPortfolio(portfolioData);
        setEvaluation(evaluationData);
      })
      .catch((err) => {
        setDashboardError(err instanceof Error ? err.message : "Failed to load dashboard data");
        if (err instanceof Error && err.message.includes("Session expired")) {
          handleLogout();
        }
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function handleLogin(username: string, password: string) {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const accessToken = await login(username, password);
      sessionStorage.setItem("access_token", accessToken);
      setToken(accessToken);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setAuthLoading(false);
    }
  }

  function handleLogout() {
    sessionStorage.removeItem("access_token");
    setToken(null);
    setResult(null);
    setPortfolio(null);
    setEvaluation(null);
  }

  async function handleSubmit(features: ClientFeatures) {
    if (!token) return;
    setPredictLoading(true);
    setPredictError(null);
    try {
      const prediction = await predictChurn(features, token);
      setResult(prediction);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Prediction failed";
      setPredictError(message);
      setResult(null);
      if (message.includes("Session expired")) {
        handleLogout();
      }
    } finally {
      setPredictLoading(false);
    }
  }

  if (!token) {
    return <LoginForm onLogin={handleLogin} loading={authLoading} error={authError} />;
  }

  return (
    <div className="app">
      <header className="app__header">
        <div className="app__header-row">
          <h1>Churn Risk Dashboard</h1>
          <button className="app__logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
        <p>Score a client's churn risk from their account profile.</p>
      </header>

      {dashboardError && <p className="app__error">{dashboardError}</p>}

      {portfolio && (
        <section className="app__portfolio">
          <div className="app__stats">
            <div className="app__stat">
              <span className="app__stat-label">Total clients</span>
              <span className="app__stat-value">{portfolio.total_clients.toLocaleString()}</span>
            </div>
            <div className="app__stat">
              <span className="app__stat-label">Average churn probability</span>
              <span className="app__stat-value">
                {Math.round(portfolio.average_churn_probability * 100)}%
              </span>
            </div>
          </div>

          <div className="app__charts">
            <div className="app__chart-card">
              <RiskDistributionChart counts={portfolio.risk_counts} />
            </div>
            <div className="app__chart-card">
              <FeatureImportanceChart features={portfolio.top_features} />
            </div>
          </div>
        </section>
      )}

      {evaluation && (
        <section className="app__portfolio">
          <h2 className="app__section-title">Model performance</h2>
          <div className="app__stats">
            <div className="app__stat">
              <span className="app__stat-label">ROC-AUC</span>
              <span className="app__stat-value">{evaluation.roc_auc.toFixed(3)}</span>
            </div>
            <div className="app__stat">
              <span className="app__stat-label">Precision</span>
              <span className="app__stat-value">{Math.round(evaluation.precision * 100)}%</span>
            </div>
            <div className="app__stat">
              <span className="app__stat-label">Recall</span>
              <span className="app__stat-value">{Math.round(evaluation.recall * 100)}%</span>
            </div>
            <div className="app__stat">
              <span className="app__stat-label">F1 score</span>
              <span className="app__stat-value">{evaluation.f1.toFixed(3)}</span>
            </div>
          </div>

          <div className="app__charts">
            <div className="app__chart-card">
              <RocCurveChart points={evaluation.roc_curve} auc={evaluation.roc_auc} />
            </div>
            <div className="app__chart-card">
              <ConfusionMatrixChart matrix={evaluation.confusion_matrix} />
            </div>
          </div>
        </section>
      )}

      <div className="app__content">
        <ClientForm onSubmit={handleSubmit} loading={predictLoading} />

        <div className="app__result">
          {predictError && <p className="app__error">{predictError}</p>}
          {result && (
            <RiskMeter probability={result.churn_probability} riskLabel={result.risk_label} />
          )}
          {!result && !predictError && (
            <p className="app__placeholder">Submit a profile to see its churn risk.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
