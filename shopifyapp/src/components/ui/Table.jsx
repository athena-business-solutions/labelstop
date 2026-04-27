import { useState } from "react";
import Button from "./Button";
import Skeleton from "./Skeleton";

export function EmptyState({ title, message, actionLabel, onAction }) {
  return (
    <div className="card grid min-h-64 place-items-center p-8 text-center">
      <div>
        <div className="mx-auto mb-4 h-20 w-24 rounded-lg border border-shopify-border bg-gradient-to-br from-white to-shopify-bg" />
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-shopify-secondary">{message}</p>
        {actionLabel ? (
          <Button className="mt-4" variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function Pagination({ total = 0, page = 1, limit = 20, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-shopify-border px-5 py-3 text-sm text-shopify-secondary">
      <span>
        Showing {start}-{end} of {total} orders
      </span>
      <div className="flex gap-2">
        <Button disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </Button>
        <Button disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}

export default function DataTable({
  columns,
  data,
  loading = false,
  selectable = false,
  onRowClick,
  bulkActions,
  pagination,
}) {
  const [selected, setSelected] = useState([]);

  if (loading) return <Skeleton variant="table" />;

  if (!data?.length) {
    return (
      <EmptyState
        title="No records found"
        message="Try changing your search or filters, or create a new record."
      />
    );
  }

  const allSelected = data.length > 0 && selected.length === data.length;

  function toggleAll() {
    setSelected(allSelected ? [] : data.map((row) => row.id));
  }

  function toggleRow(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  return (
    <div className="card overflow-hidden">
      {selected.length > 0 && bulkActions ? (
        <div className="flex flex-wrap items-center gap-3 border-b border-shopify-border bg-shopify-bg px-5 py-3">
          <strong>{selected.length} selected</strong>
          {bulkActions(selected)}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-shopify-bg text-xs font-semibold uppercase tracking-wide text-shopify-secondary">
            <tr>
              {selectable ? (
                <th className="w-10 px-5 py-3">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
              ) : null}
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-3">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                className={`border-t border-shopify-border transition hover:bg-shopify-bg ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {selectable ? (
                  <td className="px-5 py-3" onClick={(event) => event.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggleRow(row.id)}
                    />
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-3 align-middle">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination ? <Pagination {...pagination} /> : null}
    </div>
  );
}
