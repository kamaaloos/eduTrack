import { useEffect, useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 4;

export function usePaginatedList<T>(
  items: T[],
  pageSize = DEFAULT_PAGE_SIZE,
  resetKey?: string | number,
) {
  const [page, setPage] = useState(0);

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize) || 1);
  const safePage = Math.min(page, totalPages - 1);

  useEffect(() => {
    setPage(0);
  }, [resetKey, totalCount]);

  useEffect(() => {
    if (page > totalPages - 1) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  const pageItems = useMemo(
    () => items.slice(safePage * pageSize, safePage * pageSize + pageSize),
    [items, safePage, pageSize],
  );

  const rangeStart = totalCount === 0 ? 0 : safePage * pageSize + 1;
  const rangeEnd = Math.min((safePage + 1) * pageSize, totalCount);

  return {
    pageItems,
    page: safePage,
    totalPages,
    totalCount,
    pageSize,
    rangeStart,
    rangeEnd,
    canPrev: safePage > 0,
    canNext: safePage < totalPages - 1 && totalCount > 0,
    prevPage: () => setPage((p) => Math.max(0, p - 1)),
    nextPage: () => setPage((p) => Math.min(totalPages - 1, p + 1)),
  };
}
