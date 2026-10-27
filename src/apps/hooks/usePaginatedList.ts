import { useCallback, useEffect, useMemo, useState } from "react";
import type { ListParams, PaginatedResponse, SortOrder } from "../types/api";
import { getErrorMessage } from "../utils/apiError";

const SEARCH_DEBOUNCE_MS = 400;

interface Options {
  size?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  // Sent with every request, e.g. { institution_id } for operators. Keep the object stable (useMemo).
  baseParams?: ListParams;
}

interface ListState<T> {
  requestKey: string;
  rows: T[];
  totalPages: number;
  totalElements: number;
  error: string;
}

// Server side pagination, search, sorting and filters for any get_all_* endpoint.
// `fetcher` must be stable (a module level API function).
export const usePaginatedList = <T>(
  fetcher: (params: ListParams) => Promise<PaginatedResponse<T>>,
  { size = 10, sortBy, sortOrder = "desc", baseParams }: Options = {}
) => {
  const [page, setPage] = useState(1);
  const [search, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState({ sortBy, sortOrder });
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<ListState<T>>({
    requestKey: "",
    rows: [],
    totalPages: 0,
    totalElements: 0,
    error: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const params = useMemo(() => {
    const result: ListParams = {
      ...baseParams,
      page,
      size,
      search: debouncedSearch || undefined,
      sort_by: sort.sortBy,
      sort_order: sort.sortBy ? sort.sortOrder : undefined,
    };
    Object.entries(filters).forEach(([key, value]) => {
      if (value) result[key] = value;
    });
    return result;
  }, [baseParams, page, size, debouncedSearch, filters, sort]);

  const requestKey = `${JSON.stringify(params)}#${reloadCount}`;

  useEffect(() => {
    let cancelled = false;

    fetcher(params)
      .then((response) => {
        if (cancelled) return;
        setState({
          requestKey,
          rows: response.body ?? [],
          totalPages: response.total_pages,
          totalElements: response.total_elements,
          error: "",
        });
      })
      .catch((err) => {
        if (cancelled) return;
        setState((current) => ({
          ...current,
          requestKey,
          error: getErrorMessage(err, "Failed to load data"),
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, params, requestKey]);

  const setSearch = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  }, []);

  // Clicking the same column flips the order, a new column starts ascending
  const toggleSort = useCallback((key: string) => {
    setSort((current) => ({
      sortBy: key,
      sortOrder: current.sortBy === key && current.sortOrder === "asc" ? "desc" : "asc",
    }));
  }, []);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  return {
    rows: state.rows,
    totalPages: state.totalPages,
    totalElements: state.totalElements,
    error: state.error,
    loading: state.requestKey !== requestKey,
    page,
    setPage,
    search,
    setSearch,
    filters,
    setFilter,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    toggleSort,
    reload,
  };
};
