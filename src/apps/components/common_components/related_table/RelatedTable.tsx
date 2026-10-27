import '../data_table/DataTable.css';
import type { ReactNode } from "react";

import DashboardCard from "../../dashboard_components/card_component/DashboardCard";

export interface RelatedColumn<R> {
  label: string;
  render: (row: R) => ReactNode;
}

interface RelatedTableProps<R> {
  title: string;
  columns: RelatedColumn<R>[];
  rows?: R[];
  rowKey: (row: R) => string | number;
  loading?: boolean;
  error?: string;
  emptyText?: string;
}

// Compact read-only table of related records on a view page
// (an institution's courses, a course's batches, a student's payments, ...)
const RelatedTable = <R,>({
  title,
  columns,
  rows,
  rowKey,
  loading = false,
  error,
  emptyText = "Nothing here yet",
}: RelatedTableProps<R>) => (
  <DashboardCard title={title} error={error}>
    {!rows ? (
      <p className="detail-loading">{loading ? "Loading..." : emptyText}</p>
    ) : rows.length === 0 ? (
      <p className="detail-loading">{emptyText}</p>
    ) : (
      <div className="data-table related-table">
        <div className="data-table-scroll">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.label}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((column) => (
                    <td key={column.label}>{column.render(row)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )}
  </DashboardCard>
);

export default RelatedTable;
