import {
  Badge,
  BlockStack,
  Card,
  InlineGrid,
  InlineStack,
  Select,
  Text,
} from "@shopify/polaris";
import {
  Calendar,
  ChevronDown,
  CreditCard,
  PackageCheck,
  Plus,
  Sparkles,
  ArrowUp,
  RefreshCw,
} from "lucide-react";
import { useMemo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useAppContext } from "../context/AppContext";
import { useFetch } from "../hooks/useFetch";
import { endpoints } from "../services/api";
import { formatCurrency, formatNumber, formatPercent } from "../utils/formatters";

const periods = [
  { label: "Today", value: "today" },
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
];

const channelOptions = [
  { label: "All channels", value: "all" },
  { label: "Online Store", value: "online-store" },
  { label: "Retail", value: "retail" },
];

const emptySparkline = Array.from({ length: 8 }, (_, index) => ({
  value: index === 7 ? 0.0001 : 0,
}));

function MiniSparkline({ data }) {
  const hasSignal = data.some((point) => Number(point.value) > 0);
  return (
    <div className="h-10 w-24">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Tooltip
            cursor={false}
            contentStyle={{ display: "none" }}
            labelStyle={{ display: "none" }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={hasSignal ? "#0ea5ff" : "#d4d4d4"}
            strokeWidth={2}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function MetricStripCard({ title, value, change, data, showDivider }) {
  const hasChange = Number.isFinite(change);
  const hasSignal = data.some((point) => Number(point.value) > 0);
  return (
    <div
      className={`flex items-center justify-between gap-4 px-6 py-5 ${
        showDivider ? "border-r border-[#e3e3e3]" : ""
      }`}
    >
      <div className="min-w-0">
        <div className="mb-2">
          <Text as="h3" variant="bodyMd" tone="subdued" fontWeight="medium">
            {title}
          </Text>
        </div>
        <BlockStack gap="100">
          <Text as="p" variant="heading2xl" fontWeight="bold">
            {value}
          </Text>
          {hasChange ? (
            <span className="inline-flex items-center gap-1 text-[14px] font-semibold text-[#0d9f5b]">
              <ArrowUp size={14} />
              {change}%
            </span>
          ) : (
            <span className="text-[13px] font-medium text-[#8a8a8a]">
              {hasSignal ? "Waiting for change data" : "Live data unavailable"}
            </span>
          )}
        </BlockStack>
      </div>
      <MiniSparkline data={data} />
    </div>
  );
}

function TaskCard({ icon: Icon, text, muted = false }) {
  return (
    <div className="flex min-h-11 items-center gap-3 rounded-[14px] border border-[#d4d4d4] bg-white px-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <Icon className="text-[#616161]" size={18} />
      <span className={`text-[15px] font-semibold ${muted ? "text-[#8a8a8a]" : "text-[#303030]"}`}>
        {text}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { selectedDateRange, setSelectedDateRange } = useAppContext();
  const params = { period: selectedDateRange };
  const quietFetch = { toastOnError: false, refreshMs: 30000 };
  const stats = useFetch(endpoints.dashboard.stats, params, quietFetch);
  const sessions = useFetch(endpoints.dashboard.sessions, params, quietFetch);
  const orders = useFetch(
    endpoints.orders.list,
    { page: 1, limit: 250, status: "all" },
    quietFetch,
  );

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning, let's get started.";
    if (hour < 18) return "Good afternoon, let's get started.";
    return "Good evening, let's get started.";
  }, []);

  const metrics = useMemo(() => {
    const source = stats.data?.data;
    const sessionSeries = sessions.data?.data;

    const normalizedSessionSeries = (Array.isArray(sessionSeries) ? sessionSeries : []).map(
      (point) => {
        if (typeof point === "number") return { value: point };
        return {
          value:
            point.value ??
            point.sessions ??
            point.total ??
            0,
        };
      },
    );
    const sessionValue = normalizedSessionSeries[normalizedSessionSeries.length - 1]?.value;
    const metricSeries = (series) =>
      Array.isArray(series) && series.length
        ? series.map((value) => (typeof value === "number" ? { value } : value))
        : emptySparkline;

    return [
      {
        title: "Sessions",
        value: Number.isFinite(sessionValue) ? formatNumber(sessionValue) : "--",
        change: Number.isFinite(Number(source?.customers?.change))
          ? Number(source.customers.change)
          : null,
        data: normalizedSessionSeries.length ? normalizedSessionSeries : emptySparkline,
      },
      {
        title: "Total sales",
        value: Number.isFinite(Number(source?.totalSales?.value))
          ? formatCurrency(source.totalSales.value)
          : "--",
        change: Number.isFinite(Number(source?.totalSales?.change))
          ? Number(source.totalSales.change)
          : null,
        data: metricSeries(source?.totalSales?.sparkline),
      },
      {
        title: "Orders",
        value: Number.isFinite(Number(source?.orders?.value))
          ? formatNumber(source.orders.value)
          : "--",
        change: Number.isFinite(Number(source?.orders?.change))
          ? Number(source.orders.change)
          : null,
        data: metricSeries(source?.orders?.sparkline),
      },
      {
        title: "Conversion rate",
        value: Number.isFinite(Number(source?.conversionRate?.value))
          ? formatPercent(source.conversionRate.value)
          : "--",
        change: Number.isFinite(Number(source?.conversionRate?.change))
          ? Number(source.conversionRate.change)
          : null,
        data: metricSeries(source?.conversionRate?.sparkline),
      },
    ];
  }, [sessions.data, stats.data]);

  const liveVisitors = useMemo(() => {
    const latestSeriesPoint = metrics[0]?.data?.[metrics[0].data.length - 1]?.value;
    if (!Number.isFinite(latestSeriesPoint)) return null;
    return Math.max(1, Math.round(latestSeriesPoint / 1500));
  }, [metrics]);

  const orderTasks = useMemo(() => {
    const rows = orders.data?.data;
    if (!Array.isArray(rows)) {
      return {
        fulfill: null,
        capture: null,
      };
    }

    const fulfill = rows.filter(
      (row) => row.fulfillmentStatus && row.fulfillmentStatus !== "fulfilled",
    ).length;
    const capture = rows.filter(
      (row) => row.paymentStatus && row.paymentStatus !== "paid",
    ).length;

    return { fulfill, capture };
  }, [orders.data]);

  const lastUpdated = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date()),
    [stats.data, sessions.data, orders.data],
  );

  return (
    <div className="mx-auto max-w-[1220px] space-y-6 px-1 py-4">
      <div className="rounded-[18px] border border-[#dfe3e8] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <InlineStack align="space-between" blockAlign="center" wrap gap="300">
          <BlockStack gap="100">
            <Text as="h2" variant="headingLg">
              Store performance
            </Text>
            <InlineStack gap="200" blockAlign="center">
              <Badge tone={stats.error || sessions.error ? "attention" : "success"}>
                {stats.error || sessions.error ? "Partial live data" : "Live"}
              </Badge>
              <span className="inline-flex items-center gap-1 text-[13px] text-[#616161]">
                <RefreshCw size={13} />
                Updated {lastUpdated}
              </span>
            </InlineStack>
          </BlockStack>
          <Text as="p" variant="bodyMd" tone="subdued">
            Track what matters now across traffic, orders, and conversion.
          </Text>
        </InlineStack>
      </div>

      <InlineStack align="space-between" blockAlign="center" wrap gap="300">
        <InlineStack gap="300" wrap>
          <div className="min-w-[180px] rounded-[14px] border border-[#d4d4d4] bg-white px-3 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <Select
              label="Date range"
              labelHidden
              options={periods}
              value={selectedDateRange}
              onChange={setSelectedDateRange}
              prefix={<Calendar size={18} />}
            />
          </div>

          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-[#d4d4d4] bg-white px-4 text-[15px] font-semibold text-[#303030] shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <ChevronDown size={16} className="rotate-90 text-[#616161]" />
            All channels
          </button>

          <div className="inline-flex min-h-11 items-center gap-3 rounded-[14px] border border-[#d4d4d4] bg-white px-4 text-[15px] font-semibold text-[#303030] shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            <span
              className={`inline-flex h-4 w-4 rounded-full ${
                liveVisitors == null ? "bg-[#c7c7c7]" : "bg-[#4be05c]"
              }`}
            />
            {liveVisitors == null ? "Visitor count unavailable" : `${liveVisitors} live visitors`}
          </div>
        </InlineStack>
      </InlineStack>

      <div className="overflow-hidden rounded-[22px] border border-[#d4d4d4] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {metrics.map((metric, index) => (
            <MetricStripCard
              key={metric.title}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              data={metric.data}
              showDivider={index < metrics.length - 1}
            />
          ))}
        </div>
      </div>

      <InlineGrid columns={{ xs: 1, md: 2 }} gap="400">
        <TaskCard
          icon={PackageCheck}
          text={
            orderTasks.fulfill == null
              ? "Orders to fulfill unavailable"
              : `${orderTasks.fulfill}+ orders to fulfill`
          }
          muted={orderTasks.fulfill == null}
        />
        <TaskCard
          icon={CreditCard}
          text={
            orderTasks.capture == null
              ? "Payments to capture unavailable"
              : `${orderTasks.capture} payments to capture`
          }
          muted={orderTasks.capture == null}
        />
      </InlineGrid>

      <BlockStack gap="300">
        <Text as="h2" variant="heading2xl">
          {greeting}
        </Text>

        <Card padding="0">
          <div className="min-h-[140px] rounded-[18px] bg-white px-6 py-5 shadow-[0_2px_6px_rgba(0,0,0,0.06)]">
            <BlockStack gap="500">
              <BlockStack gap="100">
                <Text as="p" variant="bodyLg" tone="subdued">
                  Ask anything...
                </Text>
                <Text as="p" variant="bodyMd" tone="subdued">
                  Check store performance, review orders, or jump into the next task.
                </Text>
              </BlockStack>
              <InlineStack align="space-between" blockAlign="center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6d28d9] text-white">
                  <Sparkles size={16} />
                </div>
                <InlineStack gap="300" blockAlign="center">
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#4a4a4a] hover:bg-[#f1f1f1]"
                  >
                    <Plus size={22} />
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#efefef] text-[#b0b0b0]"
                  >
                    <ArrowUp size={18} />
                  </button>
                </InlineStack>
              </InlineStack>
            </BlockStack>
          </div>
        </Card>
      </BlockStack>
    </div>
  );
}
