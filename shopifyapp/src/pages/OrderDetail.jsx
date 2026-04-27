import { ArrowLeft } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { useFetch } from "../hooks/useFetch";
import { endpoints } from "../services/api";
import { formatCurrency, formatDate } from "../utils/formatters";

function DetailCard({ title, children }) {
  return (
    <section className="card p-5">
      <h2 className="mb-4 text-base font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function OrderDetail() {
  const { id } = useParams();
  const order = useFetch(endpoints.orders.detail(id));
  const data = order.data?.data;

  if (order.loading) return <Skeleton variant="chart" />;

  if (order.error || !data) {
    return (
      <div className="card p-5">
        <p className="mb-3 text-shopify-red">{order.error || "Order not found"}</p>
        <Button onClick={order.refetch}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link className="inline-flex items-center gap-2 font-semibold text-shopify-green" to="/orders">
        <ArrowLeft size={18} /> Orders
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold">{data.orderNumber}</h1>
        <span className="text-shopify-secondary">{formatDate(data.date)}</span>
        <Badge status={data.paymentStatus} />
        <Badge status={data.fulfillmentStatus} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,65fr)_minmax(320px,35fr)]">
        <div className="space-y-5">
          <DetailCard title="Items Ordered">
            <div className="divide-y divide-shopify-border">
              {(data.items || []).map((item) => (
                <div key={item.id || item.name} className="flex items-center gap-4 py-3">
                  {item.image ? (
                    <img className="h-12 w-12 rounded object-cover" src={item.image} alt={item.name} />
                  ) : null}
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-shopify-secondary">Qty {item.quantity}</p>
                  </div>
                  <strong>{formatCurrency(item.price)}</strong>
                </div>
              ))}
            </div>
          </DetailCard>

          <DetailCard title="Payment">
            {["subtotal", "shipping", "tax", "total", "amountPaid"].map((key) => (
              <div key={key} className="flex justify-between py-2 capitalize">
                <span>{key.replace(/([A-Z])/g, " $1")}</span>
                <strong>{formatCurrency(data.payment?.[key])}</strong>
              </div>
            ))}
          </DetailCard>

          <DetailCard title="Timeline">
            <div className="space-y-4">
              {(data.timeline || []).map((event) => (
                <div key={event.id || event.timestamp} className="border-l-2 border-shopify-border pl-4">
                  <p className="font-medium">{event.message}</p>
                  <p className="text-sm text-shopify-secondary">{formatDate(event.timestamp)}</p>
                </div>
              ))}
            </div>
          </DetailCard>
        </div>

        <div className="space-y-5">
          <DetailCard title="Customer">
            <Link className="font-semibold text-shopify-green" to={`/customers/${data.customer?.id}`}>
              {data.customer?.name}
            </Link>
            <p className="mt-2 text-shopify-secondary">{data.customer?.email}</p>
            <p className="text-shopify-secondary">{data.customer?.phone}</p>
          </DetailCard>
          <DetailCard title="Shipping Address">
            <address className="not-italic leading-6 text-shopify-secondary">{data.shippingAddress}</address>
          </DetailCard>
          <DetailCard title="Tags">
            <div className="flex flex-wrap gap-2">
              {(data.tags || []).map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </DetailCard>
          <DetailCard title="Notes">
            <p className="text-shopify-secondary">{data.notes}</p>
          </DetailCard>
        </div>
      </div>
    </div>
  );
}
