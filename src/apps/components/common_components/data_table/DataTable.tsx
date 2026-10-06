import './DataTable.css';
import type { ReactNode } from "react";
import { FiArrowDown, FiArrowUp, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import type { SortOrder } from "../../../types/api";

export interface TableColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  // Backend sort_by value; column is sortable only when set
  sortKey?: string;
}

interface DataTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyText?: string;
  sortBy?: string;
  sortOrder?: SortOrder;
  onSort?: (sortKey: string) => void;
  actions?: (row: T) => ReactNode;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

const DataTable = <T,>({
  columns,
  rows,
  rowKey,
  loading = false,
  emptyText = "No records found",
  sortBy,
  sortOrder,
  onSort,
  actions,
  page,
  totalPages,
  totalElements,
  onPageChange,
}: DataTableProps<T>) => {
  const columnCount = columns.length + (actions ? 1 : 0);

  return (
    <div className="data-table">
      <div className="data-table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((column) => {
                const sortable = !!column.sortKey && !!onSort;
                const active = sortable && sortBy === column.sortKey;
                return (
                  <th
                    key={column.key}
                    className={sortable ? "sortable" : ""}
                    onClick={sortable ? () => onSort(column.sortKey!) : undefined}
                  >
                    {column.label}
                    {active && (sortOrder === "asc" ? <FiArrowUp /> : <FiArrowDown />)}
                  </th>
                );
              })}
              {actions && <th className="actions-col">Actions</th>}
            </tr>
          </thead>

          <tbody className={loading ? "is-loading" : ""}>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount} className="data-table-empty">
                  {loading ? "Loading..." : emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render
                        ? column.render(row)
                        : String((row as Record<string, unknown>)[column.key] ?? "-")}
                    </td>
                  ))}
                  {actions && <td className="actions-col">{actions(row)}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="data-table-footer">
        <span>{totalElements} record{totalElements === 1 ? "" : "s"}</span>
        <div className="data-table-pager">
          <button disabled={page <= 1 || loading} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
            <FiChevronLeft />
          </button>
          <span>
            Page {totalPages === 0 ? 0 : page} of {totalPages}
          </span>
          <button disabled={page >= totalPages || loading} onClick={() => onPageChange(page + 1)} aria-label="Next page">
            <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
