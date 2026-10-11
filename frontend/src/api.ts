import type { ClientFeatures, ModelEvaluation, PortfolioSummary, PredictionResponse } from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function authedGet<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401) {
    throw new Error("Session expired — please log in again");
  }
  if (!response.ok) {
    throw new Error(`Request to ${path} failed (${response.status})`);
  }

  return response.json();
}

export async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  const data = await response.json();
  return data.access_token as string;
}

export async function predictChurn(
  features: ClientFeatures,
  token: string,
): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(features),
  });

  if (response.status === 401) {
    throw new Error("Session expired — please log in again");
  }
  if (!response.ok) {
    throw new Error(`Prediction request failed (${response.status})`);
  }

  return response.json();
}

export function getPortfolioSummary(token: string): Promise<PortfolioSummary> {
  return authedGet<PortfolioSummary>("/portfolio/summary", token);
}

export function getModelEvaluation(token: string): Promise<ModelEvaluation> {
  return authedGet<ModelEvaluation>("/model/evaluation", token);
}
