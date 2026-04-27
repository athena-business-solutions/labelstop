import {
  Archive,
  CalendarDays,
  ChevronDown,
  ChevronsUpDown,
  Download,
  FilePenLine,
  HandCoins,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { useDebounce } from "../hooks/useDebounce";
import { useFetch } from "../hooks/useFetch";
import api, { endpoints } from "../services/api";
import { formatCurrency } from "../utils/formatters";

const tabs = ["all", "open", "unfulfilled", "unpaid", "closed", "archived"];

const paymentPillStyles = {
  paid: "bg-[#ececec] text-[#4a4a4a]",
  pending: "bg-[#ffd79d] text-[#6b4f00]",
  refunded: "bg-[#ffe0db] text-[#8a2d1f]",
};

const fulfillmentPillStyles = {
  fulfilled: "bg-[#dff1e3] text-[#1f6b3f]",
  unfulfilled: "bg-[#ffe26e] text-[#5d4b00]",
  partial: "bg-[#dceeff] text-[#165b96]",
};

const draftPillStyles = {
  open: "bg-[#ffe26e] text-[#5d4b00]",
  completed: "bg-[#ececec] text-[#4a4a4a]",
  "invoice sent": "bg-[#dceeff] text-[#165b96]",
};

const recoveryPillStyles = {
  recovered: "bg-[#dff1e3] text-[#1f6b3f]",
  "not recovered": "bg-[#ffd79d] text-[#6b4f00]",
};

function MetricSparkline({ values }) {
  const points = values?.filter((value) => Number.isFinite(value)) || [];

  if (!points.length || points.every((value) => value === 0)) {
    return <div className="h-8 w-28 rounded-full bg-[#f6f6f7]" />;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const width = 112;
  const height = 32;
  const range = max - min || 1;
  const d = points
    .map((value, index) => {
      const x = (index / Math.max(points.length - 1, 1)) * width;
      const y = height - ((value - min) / range) * (height - 6) - 3;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg className="h-8 w-28 shrink-0" viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={d} stroke="#08a1ff" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function MetricCard({ label, value, meta, sparkline, first = false }) {
  return (
    <div
      className={`flex min-h-[102px] items-center justify-between gap-4 px-6 py-5 ${
        first ? "" : "border-l border-[#e1e3e5]"
      }`}
    >
      <div className="space-y-1">
        <div className="border-b border-dotted border-[#8c9196] pb-1 text-[13px] font-semibold text-[#303030]">
          {label}
        </div>
        <div className="text-[18px] font-semibold text-[#202223]">{value}</div>
        <div className="text-sm text-[#6d7175]">{meta}</div>
      </div>
      <MetricSparkline values={sparkline} />
    </div>
  );
}

function StatusPill({ type, value }) {
  if (!value) return <span className="text-sm text-[#8c9196]">Unavailable</span>;

  const normalized = String(value).toLowerCase();
  const styleMap = type === "payment" ? paymentPillStyles : fulfillmentPillStyles;
  const classes = styleMap[normalized] || "bg-[#ececec] text-[#4a4a4a]";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium capitalize ${classes}`}
    >
      <span className="h-2.5 w-2.5 rounded-full border border-current" />
      {normalized.replace(/-/g, " ")}
    </span>
  );
}

function DraftStatusPill({ value }) {
  const normalized = String(value || "open").toLowerCase().replace(/-/g, " ");
  const classes = draftPillStyles[normalized] || "bg-[#ececec] text-[#4a4a4a]";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium capitalize ${classes}`}
    >
      <span className="h-2.5 w-2.5 rounded-full border border-current" />
      {normalized}
    </span>
  );
}

function RecoveryStatusPill({ value }) {
  const normalized = String(value || "not recovered").toLowerCase().replace(/-/g, " ");
  const classes = recoveryPillStyles[normalized] || "bg-[#ececec] text-[#4a4a4a]";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium capitalize ${classes}`}
    >
      {normalized}
    </span>
  );
}

function formatOrderDate(dateValue) {
  if (!dateValue) return "Unknown";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return String(dateValue);

  const now = new Date();
  const minutes = Math.round((now.getTime() - date.getTime()) / 60000);
  if (minutes >= 0 && minutes < 60) {
    return `${minutes || 1} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getCustomerName(row) {
  if (typeof row.customer === "string") return row.customer;
  return row.customer?.name || "";
}

function getChannel(row) {
  return row.channel || row.salesChannel || "Online Store";
}

function getDraftStatus(row) {
  return row.draftStatus || row.status || row.paymentStatus || "open";
}

function getPoNumber(row) {
  return row.poNumber || row.purchaseOrderNumber || "—";
}

function getRegion(row) {
  return row.region || row.customer?.region || row.shippingAddress?.country || "Unknown";
}

function getRecoveryStatus(row) {
  return row.recoveryStatus || row.statusLabel || "not recovered";
}

function getItemCount(row) {
  if (Array.isArray(row.items)) {
    return row.items.reduce(
      (total, item) => total + Number(item.quantity || item.qty || 1 || 0),
      0,
    );
  }

  return Number(row.items || row.itemCount || 0);
}

function getSparklineValues(rows, selector) {
  if (!rows.length) return [];

  const values = rows.slice(0, 10).map(selector);
  return values.map((value) => (Number.isFinite(Number(value)) ? Number(value) : 0));
}

export default function Orders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selected, setSelected] = useState([]);
  const debouncedSearch = useDebounce(search);
  const page = Number(searchParams.get("page") || 1);
  const status = searchParams.get("status") || "all";
  const paymentStatus = searchParams.get("paymentStatus") || "";
  const fulfillmentStatus = searchParams.get("fulfillmentStatus") || "";
  const date = searchParams.get("date") || "";
  const isDraftsView = status === "draft";
  const isAbandonedView = status === "abandoned";

  useEffect(() => {
    setSearchParams({
      page: String(page),
      limit: "20",
      status,
      search: debouncedSearch,
      paymentStatus,
      fulfillmentStatus,
      date,
    });
  }, [date, debouncedSearch, fulfillmentStatus, page, paymentStatus, setSearchParams, status]);

  const query = useMemo(
    () => ({
      page,
      limit: 20,
      status,
      search: debouncedSearch,
      paymentStatus,
      fulfillmentStatus,
      date,
    }),
    [date, debouncedSearch, fulfillmentStatus, page, paymentStatus, status],
  );

  const orders = useFetch(endpoints.orders.list, query, { refreshMs: 30000 });
  const rows = orders.data?.data || [];
  const pagination = orders.data?.pagination || {};

  useEffect(() => {
    setSelected((current) => current.filter((id) => rows.some((row) => row.id === id)));
  }, [rows]);

  function updateParam(key, value) {
    const next = Object.fromEntries(searchParams);

    if (value) {
      next[key] = value;
    } else {
      delete next[key];
    }

    next.page = "1";
    setSearchParams(next);
  }

  async function bulkFulfill(selectedIds) {
    try {
      await Promise.all(selectedIds.map((id) => api.put(endpoints.orders.fulfill(id))));
      toast.success("Orders fulfilled successfully");
      setSelected([]);
      orders.refetch();
    } catch (error) {
      toast.error(error.message);
    }
  }

  const allSelected = rows.length > 0 && selected.length === rows.length;

  function toggleAll() {
    setSelected(allSelected ? [] : rows.map((row) => row.id));
  }

  function toggleRow(id) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  const summary = useMemo(() => {
    const totalOrders = Number(pagination.total || rows.length || 0);
    const itemCount = rows.reduce((total, row) => total + getItemCount(row), 0);
    const returnsValue = rows.reduce((total, row) => {
      if (String(row.paymentStatus).toLowerCase() === "refunded") {
        return total - Number(row.total || 0);
      }
      return total;
    }, 0);
    const fulfilledCount = rows.filter(
      (row) => String(row.fulfillmentStatus).toLowerCase() === "fulfilled",
    ).length;

    return {
      totalOrders,
      itemCount,
      returnsValue,
      fulfilledCount,
      orderTrend: getSparklineValues(rows, (row) => Number(row.total || 0)),
      itemTrend: getSparklineValues(rows, (row) => getItemCount(row)),
      returnTrend: getSparklineValues(rows, (row) =>
        String(row.paymentStatus).toLowerCase() === "refunded" ? Number(row.total || 0) : 0,
      ),
      fulfillmentTrend: getSparklineValues(rows, (row) =>
        String(row.fulfillmentStatus).toLowerCase() === "fulfilled" ? 1 : 0,
      ),
    };
  }, [pagination.total, rows]);

  const totalPages = Math.max(1, Math.ceil((pagination.total || 0) / 20));

  if (orders.loading && !rows.length) {
    return <Skeleton variant="table" />;
  }

  if (isDraftsView) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FilePenLine className="text-[#303030]" size={22} />
            <h1 className="text-[28px] font-semibold tracking-tight text-[#202223]">Drafts</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button className="rounded-xl border-[#d2d5d8] bg-[#f6f6f7] px-4 py-2 text-[15px] font-semibold text-[#303030] hover:bg-[#eceef0]">
              Export
            </Button>
            <Button
              variant="primary"
              className="rounded-xl border-[#303030] bg-[#303030] px-4 py-2 text-[15px] hover:bg-black"
            >
              <Plus size={16} /> Create order
            </Button>
          </div>
        </div>

        <section className="overflow-hidden rounded-[22px] border border-[#dfe3e8] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="border-b border-[#eceef0] px-4 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[#303030]">
                <span className="rounded-full bg-[#f1f2f3] px-3 py-1">All</span>
                <ChevronsUpDown size={16} className="text-[#6d7175]" />
              </div>

              <label className="flex min-w-[260px] flex-1 items-center gap-3 rounded-xl border border-transparent bg-white px-3 py-2 text-[#6d7175] shadow-[inset_0_0_0_1px_#dfe3e8]">
                <Search size={18} />
                <input
                  className="w-full border-0 bg-transparent text-[15px] text-[#202223] outline-none placeholder:text-[#6d7175]"
                  placeholder="Search and filter"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>

              <Button className="rounded-xl border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175] hover:bg-[#f6f6f7]">
                <MoreHorizontal size={18} />
              </Button>
            </div>
          </div>

          {selected.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-[#eceef0] bg-[#f6f6f7] px-4 py-3">
              <span className="text-sm font-semibold text-[#202223]">{selected.length} selected</span>
              <Button className="rounded-xl">
                <Download size={16} /> Export selected
              </Button>
              <Button variant="danger" className="rounded-xl">
                <Trash2 size={16} /> Delete
              </Button>
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#eceef0] text-[13px] font-semibold text-[#4a4a4a]">
                  <th className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-6 w-6 rounded-md border-[#aeb4b9]"
                    />
                  </th>
                  <th className="px-5 py-3">Draft order</th>
                  <th className="px-5 py-3">PO number</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#eceef0] text-[15px] text-[#202223] transition hover:bg-[#fafbfb]"
                    >
                      <td className="px-5 py-3" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.includes(row.id)}
                          onChange={() => toggleRow(row.id)}
                          className="h-6 w-6 rounded-md border-[#aeb4b9]"
                        />
                      </td>
                      <td
                        className="cursor-pointer px-5 py-3 font-semibold text-[#1f5199]"
                        onClick={() => navigate(`/orders/${row.id}`)}
                      >
                        {row.orderNumber}
                      </td>
                      <td className="px-5 py-3 text-[#6d7175]">{getPoNumber(row)}</td>
                      <td className="px-5 py-3 text-[#303030]">{formatOrderDate(row.date)}</td>
                      <td className="px-5 py-3">{getCustomerName(row) || "No customer"}</td>
                      <td className="px-5 py-3">
                        <DraftStatusPill value={getDraftStatus(row)} />
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        {formatCurrency(row.total || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="space-y-2">
                        <div className="text-base font-semibold text-[#202223]">No drafts found</div>
                        <div className="text-sm text-[#6d7175]">
                          Create a draft order or change your search to see more results.
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eceef0] px-5 py-4 text-sm text-[#6d7175]">
            <span>
              Showing {rows.length ? (page - 1) * 20 + 1 : 0}-
              {Math.min(page * 20, Number(pagination.total || rows.length || 0))} of{" "}
              {pagination.total || rows.length || 0} drafts
            </span>
            <div className="flex items-center gap-2">
              <Button
                className="rounded-xl"
                disabled={page <= 1}
                onClick={() => updateParam("page", String(page - 1))}
              >
                Previous
              </Button>
              <span className="px-2 text-[#303030]">
                Page {page} of {totalPages}
              </span>
              <Button
                className="rounded-xl"
                disabled={page >= totalPages}
                onClick={() => updateParam("page", String(page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (isAbandonedView) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <HandCoins className="text-[#303030]" size={22} />
            <h1 className="text-[28px] font-semibold tracking-tight text-[#202223]">
              Abandoned checkouts
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              className="rounded-xl border-[#303030] bg-[#303030] px-4 py-2 text-[15px] hover:bg-black"
            >
              Export
            </Button>
          </div>
        </div>

        <section className="overflow-hidden rounded-[22px] border border-[#dfe3e8] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <div className="border-b border-[#eceef0] px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-[#e8e9eb] px-4 py-2 text-[15px] font-semibold text-[#303030]">
                  All
                </span>
                <button
                  type="button"
                  className="rounded-xl px-2 py-1 text-[28px] leading-none text-[#4a4a4a] hover:bg-[#f6f6f7]"
                >
                  +
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-3 rounded-xl border border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175]">
                  <Search size={20} />
                  <input
                    className="w-0 min-w-[160px] border-0 bg-transparent text-[15px] text-[#202223] outline-none placeholder:text-[#6d7175]"
                    placeholder="Search and filter"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <Button className="rounded-xl border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175] hover:bg-[#f6f6f7]">
                  <MoreHorizontal size={18} />
                </Button>
                <Button className="rounded-xl border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175] hover:bg-[#f6f6f7]">
                  <ArrowUpDown size={18} />
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[#eceef0] text-[13px] font-semibold text-[#4a4a4a]">
                  <th className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      className="h-6 w-6 rounded-md border-[#aeb4b9]"
                    />
                  </th>
                  <th className="px-5 py-3">Checkout</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Region</th>
                  <th className="px-5 py-3">Recovery Status</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.length ? (
                  rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-[#eceef0] text-[15px] text-[#202223] transition hover:bg-[#fafbfb]"
                    >
                      <td className="px-5 py-3" onClick={(event) => event.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selected.includes(row.id)}
                          onChange={() => toggleRow(row.id)}
                          className="h-6 w-6 rounded-md border-[#aeb4b9]"
                        />
                      </td>
                      <td
                        className="cursor-pointer px-5 py-3 font-semibold text-[#1f5199]"
                        onClick={() => navigate(`/orders/${row.id}`)}
                      >
                        {row.orderNumber}
                      </td>
                      <td className="px-5 py-3 text-[#303030]">{formatOrderDate(row.date)}</td>
                      <td className="px-5 py-3">{getCustomerName(row) || "No customer"}</td>
                      <td className="px-5 py-3">{getRegion(row)}</td>
                      <td className="px-5 py-3">
                        <RecoveryStatusPill value={getRecoveryStatus(row)} />
                      </td>
                      <td className="px-5 py-3 text-right font-medium">
                        {formatCurrency(row.total || 0)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="space-y-2">
                        <div className="text-base font-semibold text-[#202223]">
                          No abandoned checkouts found
                        </div>
                        <div className="text-sm text-[#6d7175]">
                          Check back later or change your search to see more results.
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eceef0] px-5 py-4 text-sm text-[#6d7175]">
            <span>
              Showing {rows.length ? (page - 1) * 20 + 1 : 0}-
              {Math.min(page * 20, Number(pagination.total || rows.length || 0))} of{" "}
              {pagination.total || rows.length || 0} checkouts
            </span>
            <div className="flex items-center gap-2">
              <Button
                className="rounded-xl"
                disabled={page <= 1}
                onClick={() => updateParam("page", String(page - 1))}
              >
                Previous
              </Button>
              <span className="px-2 text-[#303030]">
                Page {page} of {totalPages}
              </span>
              <Button
                className="rounded-xl"
                disabled={page >= totalPages}
                onClick={() => updateParam("page", String(page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Archive className="text-[#303030]" size={22} />
          <h1 className="text-[28px] font-semibold tracking-tight text-[#202223]">Orders</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="rounded-xl border-[#d2d5d8] bg-[#f6f6f7] px-4 py-2 text-[15px] font-semibold text-[#303030] hover:bg-[#eceef0]">
            Export
          </Button>
          <Button className="rounded-xl border-[#d2d5d8] bg-[#f6f6f7] px-4 py-2 text-[15px] font-semibold text-[#303030] hover:bg-[#eceef0]">
            More actions <ChevronDown size={16} />
          </Button>
          <Button
            variant="primary"
            className="rounded-xl border-[#303030] bg-[#303030] px-4 py-2 text-[15px] hover:bg-black"
          >
            <Plus size={16} /> Create order
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[22px] border border-[#dfe3e8] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="grid md:grid-cols-[190px_repeat(4,minmax(0,1fr))]">
          <div className="flex items-center gap-3 px-6 py-5 text-[#303030]">
            <CalendarDays size={20} />
            <span className="text-[15px] font-medium">{date ? date : "Today"}</span>
          </div>
          <MetricCard
            first
            label="Orders"
            value={summary.totalOrders}
            meta="Live from current results"
            sparkline={summary.orderTrend}
          />
          <MetricCard
            label="Items ordered"
            value={summary.itemCount}
            meta="Counted from visible orders"
            sparkline={summary.itemTrend}
          />
          <MetricCard
            label="Returns"
            value={formatCurrency(summary.returnsValue)}
            meta="Refunded orders in view"
            sparkline={summary.returnTrend}
          />
          <MetricCard
            label="Orders fulfilled"
            value={summary.fulfilledCount}
            meta="Marked fulfilled"
            sparkline={summary.fulfillmentTrend}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-[22px] border border-[#dfe3e8] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="border-b border-[#eceef0] px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-[15px] font-semibold text-[#303030]">
              <span className="rounded-full bg-[#f1f2f3] px-3 py-1 capitalize">
                {status === "all" ? "All" : status}
              </span>
              <ChevronsUpDown size={16} className="text-[#6d7175]" />
            </div>

            <label className="flex min-w-[260px] flex-1 items-center gap-3 rounded-xl border border-transparent bg-white px-3 py-2 text-[#6d7175] shadow-[inset_0_0_0_1px_#dfe3e8]">
              <Search size={18} />
              <input
                className="w-full border-0 bg-transparent text-[15px] text-[#202223] outline-none placeholder:text-[#6d7175]"
                placeholder="Search and filter"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>

            <select
              className="rounded-xl border border-[#dfe3e8] bg-[#f6f6f7] px-3 py-2 text-sm text-[#303030] outline-none"
              value={paymentStatus}
              onChange={(event) => updateParam("paymentStatus", event.target.value)}
            >
              <option value="">Payment status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>

            <select
              className="rounded-xl border border-[#dfe3e8] bg-[#f6f6f7] px-3 py-2 text-sm text-[#303030] outline-none"
              value={fulfillmentStatus}
              onChange={(event) => updateParam("fulfillmentStatus", event.target.value)}
            >
              <option value="">Fulfillment status</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="unfulfilled">Unfulfilled</option>
              <option value="partial">Partial</option>
            </select>

            <select
              className="rounded-xl border border-[#dfe3e8] bg-[#f6f6f7] px-3 py-2 text-sm text-[#303030] outline-none"
              value={status}
              onChange={(event) => updateParam("status", event.target.value)}
            >
              {tabs.map((tab) => (
                <option key={tab} value={tab}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </option>
              ))}
            </select>

            <Button className="rounded-xl border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175] hover:bg-[#f6f6f7]">
              <MoreHorizontal size={18} />
            </Button>
          </div>
        </div>

        {selected.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 border-b border-[#eceef0] bg-[#f6f6f7] px-4 py-3">
            <span className="text-sm font-semibold text-[#202223]">{selected.length} selected</span>
            <Button className="rounded-xl" onClick={() => bulkFulfill(selected)}>
              <Archive size={16} /> Mark fulfilled
            </Button>
            <Button className="rounded-xl">
              <Download size={16} /> Export selected
            </Button>
            <Button variant="danger" className="rounded-xl">
              <Trash2 size={16} /> Delete
            </Button>
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1180px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eceef0] text-[13px] font-semibold text-[#4a4a4a]">
                <th className="w-12 px-5 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-6 w-6 rounded-md border-[#aeb4b9]"
                  />
                </th>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Channel</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Payment status</th>
                <th className="px-5 py-3">Fulfillment status</th>
                <th className="px-5 py-3">Items</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#eceef0] text-[15px] text-[#202223] transition hover:bg-[#fafbfb]"
                  >
                    <td className="px-5 py-3" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="h-6 w-6 rounded-md border-[#aeb4b9]"
                      />
                    </td>
                    <td
                      className="cursor-pointer px-5 py-3 font-semibold text-[#1f5199]"
                      onClick={() => navigate(`/orders/${row.id}`)}
                    >
                      {row.orderNumber}
                    </td>
                    <td className="px-5 py-3 text-[#303030]">{formatOrderDate(row.date)}</td>
                    <td className="px-5 py-3">{getCustomerName(row)}</td>
                    <td className="px-5 py-3">{getChannel(row)}</td>
                    <td className="px-5 py-3 font-medium">{formatCurrency(row.total || 0)}</td>
                    <td className="px-5 py-3">
                      <StatusPill type="payment" value={row.paymentStatus} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill type="fulfillment" value={row.fulfillmentStatus} />
                    </td>
                    <td className="px-5 py-3">
                      {getItemCount(row)} item{getItemCount(row) === 1 ? "" : "s"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-16 text-center">
                    <div className="space-y-2">
                      <div className="text-base font-semibold text-[#202223]">No orders found</div>
                      <div className="text-sm text-[#6d7175]">
                        Try changing your filters or search to see more orders.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#eceef0] px-5 py-4 text-sm text-[#6d7175]">
          <span>
            Showing {rows.length ? (page - 1) * 20 + 1 : 0}-
            {Math.min(page * 20, Number(pagination.total || rows.length || 0))} of{" "}
            {pagination.total || rows.length || 0} orders
          </span>
          <div className="flex items-center gap-2">
            <Button
              className="rounded-xl"
              disabled={page <= 1}
              onClick={() => updateParam("page", String(page - 1))}
            >
              Previous
            </Button>
            <span className="px-2 text-[#303030]">
              Page {page} of {totalPages}
            </span>
            <Button
              className="rounded-xl"
              disabled={page >= totalPages}
              onClick={() => updateParam("page", String(page + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
