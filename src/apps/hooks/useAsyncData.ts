import { useEffect, useState } from "react";
import { getErrorMessage } from "../utils/apiError";

interface AsyncState<T> {
  // The loader this result belongs to; a different loader means a new request is in flight
  loader?: () => Promise<T>;
  data?: T;
  error: string;
}

// Runs `load` and re-runs it whenever the function changes.
// Wrap it in useCallback with its inputs as deps, e.g.
//   const load = useCallback(() => getSummary({ institution_id }), [institution_id]);
// Previous data stays visible while the next request loads.
export const useAsyncData = <T>(load: () => Promise<T>) => {
  const [state, setState] = useState<AsyncState<T>>({ error: "" });

  useEffect(() => {
    let cancelled = false;

    load()
      .then((data) => {
        if (!cancelled) setState({ loader: load, data, error: "" });
      })
      .catch((err) => {
        if (!cancelled) setState((current) => ({ ...current, loader: load, error: getErrorMessage(err, "Failed to load") }));
      });

    return () => {
      cancelled = true;
    };
  }, [load]);

  return {
    data: state.data,
    error: state.error,
    loading: state.loader !== load,
  };
};
