"use client";

import { useEffect, useState } from "react";

type DiagnosticsResponse = {
  timestamp: string;
  env: {
    POSTGRES_URL: boolean;
    BETTER_AUTH_SECRET: boolean;
    GOOGLE_CLIENT_ID: boolean;
    GOOGLE_CLIENT_SECRET: boolean;
    OPENROUTER_API_KEY: boolean;
    NEXT_PUBLIC_APP_URL: boolean;
  };
  database: {
    connected: boolean;
    schemaApplied: boolean;
    error?: string;
  };
  auth: {
    configured: boolean;
    routeResponding: boolean | null;
  };
  ai: {
    configured: boolean;
  };
  overallStatus: "ok" | "warn" | "error";
};

export function useDiagnostics() {
  const [data, setData] = useState<DiagnosticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function refetch() {
    setLoading(true);
    setError(null);
    fetch("/api/diagnostics", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json as DiagnosticsResponse);
      })
      .catch((e) => {
        setError(
          e instanceof Error ? e.message : "Failed to load diagnostics"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    fetch("/api/diagnostics", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json as DiagnosticsResponse);
      })
      .catch((e) => {
        setError(
          e instanceof Error ? e.message : "Failed to load diagnostics"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const isAuthReady =
    data?.auth.configured &&
    data?.database.connected &&
    data?.database.schemaApplied;
  const isAiReady = data?.ai.configured;

  return {
    data,
    loading,
    error,
    refetch,
    isAuthReady: Boolean(isAuthReady),
    isAiReady: Boolean(isAiReady),
  };
}
