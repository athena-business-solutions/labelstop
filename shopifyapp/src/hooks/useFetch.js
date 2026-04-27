import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../services/api";

function isCanceledRequest(error) {
  return (
    axios.isCancel(error) ||
    error.name === "CanceledError" ||
    error.code === "ERR_CANCELED"
  );
}

export function useFetch(url, params = {}, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const stableParams = useMemo(() => JSON.stringify(params), [params]);

  const refetch = useCallback(() => {
    setRefreshIndex((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!url) return undefined;

    const controller = new AbortController();
    const parsedParams = JSON.parse(stableParams || "{}");

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(url, {
          params: parsedParams,
          signal: controller.signal,
        });
        setData(response.data);
      } catch (requestError) {
        if (isCanceledRequest(requestError)) return;
        setError(requestError.message);
        if (options.toastOnError !== false) {
          toast.error(requestError.message || "Failed to load data", {
            id: requestError.isNetworkError ? "api-network-error" : undefined,
          });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadData();
    return () => controller.abort();
  }, [url, stableParams, refreshIndex, options.toastOnError]);

  useEffect(() => {
    if (!url || !options.refreshMs) return undefined;

    const intervalId = window.setInterval(() => {
      setRefreshIndex((value) => value + 1);
    }, options.refreshMs);

    return () => window.clearInterval(intervalId);
  }, [url, options.refreshMs]);

  return { data, loading, error, refetch };
}
