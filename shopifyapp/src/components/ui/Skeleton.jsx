export default function Skeleton({ variant = "card", rows = 6 }) {
  if (variant === "table") {
    return (
      <div className="card overflow-hidden p-5">
        <div className="mb-4 h-5 w-36 animate-pulse rounded bg-gray-200" />
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-5 gap-4 border-t border-shopify-border py-3"
          >
            <span className="h-4 animate-pulse rounded bg-gray-200" />
            <span className="h-4 animate-pulse rounded bg-gray-200" />
            <span className="h-4 animate-pulse rounded bg-gray-200" />
            <span className="h-4 animate-pulse rounded bg-gray-200" />
            <span className="h-4 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className="card p-5">
        <div className="mb-5 h-5 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-72 animate-pulse rounded bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="mb-4 h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mb-3 h-8 w-32 animate-pulse rounded bg-gray-200" />
      <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
    </div>
  );
}
