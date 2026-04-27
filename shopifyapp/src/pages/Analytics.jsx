import { DollarSign, Percent, ShoppingCart, Users } from "lucide-react";
import SalesLineChart from "../components/charts/SalesLineChart";
import TrafficBarChart from "../components/charts/TrafficBarChart";
import KPICard from "../components/ui/KPICard";
import Skeleton from "../components/ui/Skeleton";
import DataTable from "../components/ui/Table";
import { useAppContext } from "../context/AppContext";
import { useFetch } from "../hooks/useFetch";
import { endpoints } from "../services/api";
import { formatCurrency, formatNumber, formatPercent } from "../utils/formatters";

export default function Analytics() {
  const { selectedDateRange, setSelectedDateRange } = useAppContext();
  const params = { period: selectedDateRange };
  const stats = useFetch(endpoints.dashboard.stats, params);
  const sales = useFetch(endpoints.analytics.sales, params);
  const devices = useFetch(endpoints.analytics.devices);
  const sources = useFetch(endpoints.analytics.sources);
  const topProducts = useFetch(endpoints.analytics.topProducts);
  const geography = useFetch(endpoints.analytics.geography);
  const kpis = stats.data?.data || {};

  const productColumns = [
    { key: "name", header: "Product" },
    {
      key: "unitsSold",
      header: "Units Sold",
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="w-16">{formatNumber(row.unitsSold)}</span>
          <span className="h-2 flex-1 rounded bg-shopify-bg">
            <span className="block h-2 rounded bg-shopify-green" style={{ width: `${row.percent || 0}%` }} />
          </span>
        </div>
      ),
    },
  ];
  const geoColumns = [
    { key: "country", header: "Country" },
    { key: "sessions", header: "Sessions", render: (row) => formatNumber(row.sessions) },
    { key: "orders", header: "Orders", render: (row) => formatNumber(row.orders) },
    { key: "revenue", header: "Revenue", render: (row) => formatCurrency(row.revenue) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <select className="rounded border border-shopify-border bg-white px-3 py-2" value={selectedDateRange} onChange={(event) => setSelectedDateRange(event.target.value)}>
          <option value="today">Today</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="custom">Custom range</option>
        </select>
      </div>

      {stats.loading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KPICard title="Total Sales" value={formatCurrency(kpis.totalSales?.value)} change={kpis.totalSales?.change} period="vs last period" icon={<DollarSign size={18} />} data={kpis.totalSales?.sparkline} />
          <KPICard title="Orders" value={formatNumber(kpis.orders?.value)} change={kpis.orders?.change} period="vs last period" icon={<ShoppingCart size={18} />} data={kpis.orders?.sparkline} />
          <KPICard title="Customers" value={formatNumber(kpis.customers?.value)} change={kpis.customers?.change} period="vs last period" icon={<Users size={18} />} data={kpis.customers?.sparkline} />
          <KPICard title="Conversion Rate" value={formatPercent(kpis.conversionRate?.value)} change={kpis.conversionRate?.change} period="vs last period" icon={<Percent size={18} />} data={kpis.conversionRate?.sparkline} />
        </div>
      )}

      <section className="card p-5">
        <h2 className="mb-4 text-xl font-semibold">Sales over time</h2>
        {sales.loading ? <Skeleton variant="chart" /> : <SalesLineChart data={sales.data?.data || []} />}
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="card p-5">
          <h2 className="mb-4 text-xl font-semibold">Sessions by device</h2>
          {devices.loading ? <Skeleton variant="chart" /> : <TrafficBarChart data={devices.data?.data || []} />}
        </section>
        <section className="card p-5">
          <h2 className="mb-4 text-xl font-semibold">Top traffic sources</h2>
          {sources.loading ? <Skeleton variant="chart" /> : <TrafficBarChart data={sources.data?.data || []} horizontal />}
        </section>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Top products by units sold</h2>
        <DataTable columns={productColumns} data={topProducts.data?.data || []} loading={topProducts.loading} />
      </section>
      <section>
        <h2 className="mb-3 text-xl font-semibold">Geographic data</h2>
        <DataTable columns={geoColumns} data={geography.data?.data || []} loading={geography.loading} />
      </section>
    </div>
  );
}
