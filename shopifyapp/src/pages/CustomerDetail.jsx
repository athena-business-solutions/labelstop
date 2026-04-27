import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import DataTable from "../components/ui/Table";
import { useFetch } from "../hooks/useFetch";
import { endpoints } from "../services/api";
import { formatCurrency, formatDate, initials } from "../utils/formatters";

function Card({ title, children }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function CustomerDetail() {
  const { id } = useParams();
  const customer = useFetch(endpoints.customers.detail(id));
  const data = customer.data?.data;

  if (customer.loading) return <Skeleton variant="chart" />;

  if (customer.error || !data) {
    return (
      <div className="card p-5">
        <p className="mb-3 text-shopify-red">{customer.error || "Customer not found"}</p>
        <Button onClick={customer.refetch}>Try again</Button>
      </div>
    );
  }

  const columns = [
    { key: "orderNumber", header: "Order#" },
    { key: "date", header: "Date", render: (row) => formatDate(row.date) },
    { key: "paymentStatus", header: "Payment", render: (row) => <Badge status={row.paymentStatus} /> },
    { key: "fulfillmentStatus", header: "Fulfillment", render: (row) => <Badge status={row.fulfillmentStatus} /> },
    { key: "total", header: "Total", render: (row) => formatCurrency(row.total) },
  ];

  return (
    <div className="space-y-5">
      <Link className="inline-flex items-center gap-2 font-semibold text-shopify-green" to="/customers">
        <ArrowLeft size={18} /> Customers
      </Link>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,65fr)_minmax(320px,35fr)]">
        <div className="space-y-5">
          <Card title="Last order">
            {data.lastOrder ? (
              <div className="flex justify-between">
                <Link className="font-semibold text-shopify-green" to={`/orders/${data.lastOrder.id}`}>
                  {data.lastOrder.orderNumber}
                </Link>
                <strong>{formatCurrency(data.lastOrder.total)}</strong>
              </div>
            ) : (
              <p className="text-shopify-secondary">No last order available.</p>
            )}
          </Card>
          <Card title="Order history">
            <DataTable columns={columns} data={data.orders || []} />
          </Card>
          <Card title="Timeline">
            <div className="space-y-4">
              {(data.timeline || []).map((event) => (
                <div key={event.id || event.timestamp} className="border-l-2 border-shopify-border pl-4">
                  <p className="font-medium">{event.message}</p>
                  <p className="text-sm text-shopify-secondary">{formatDate(event.timestamp)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="space-y-5">
          <Card title="Customer overview">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-shopify-green text-white">
                {initials(data.name)}
              </span>
              <div>
                <h1 className="font-semibold">{data.name}</h1>
                <p className="text-sm text-shopify-secondary">Joined {formatDate(data.joinDate)}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {(data.tags || []).map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
          </Card>
          <Card title="Contact information">
            <p>{data.email}</p>
            <p className="text-shopify-secondary">{data.phone}</p>
          </Card>
          <Card title="Default address">
            <address className="not-italic text-shopify-secondary">{data.defaultAddress}</address>
          </Card>
          <Card title="Tax exemptions">
            <p className="text-shopify-secondary">{data.taxExemptions}</p>
          </Card>
          <Card title="Notes">
            <p className="text-shopify-secondary">{data.notes}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
