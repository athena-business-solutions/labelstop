const statusStyles = {
  paid: "bg-emerald-100 text-emerald-800",
  pending: "bg-yellow-100 text-yellow-900",
  refunded: "bg-red-100 text-red-800",
  fulfilled: "bg-emerald-100 text-emerald-800",
  unfulfilled: "bg-gray-100 text-gray-700",
  partial: "bg-blue-100 text-blue-800",
  active: "bg-emerald-100 text-emerald-800",
  draft: "bg-gray-100 text-gray-700",
  archived: "bg-red-100 text-red-800",
  open: "bg-blue-100 text-blue-800",
  closed: "bg-gray-100 text-gray-700",
};

export default function Badge({ status, children }) {
  const label = children || String(status || "").replace(/-/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium capitalize ${
        statusStyles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {label}
    </span>
  );
}
