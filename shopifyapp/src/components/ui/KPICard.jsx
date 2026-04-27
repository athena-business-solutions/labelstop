import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { memo } from "react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

function KPICard({ title, value, change = 0, period, icon, data = [] }) {
  const positive = Number(change) >= 0;

  return (
    <article className="card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-shopify-secondary">{title}</p>
        <span className="grid h-8 w-8 place-items-center rounded bg-shopify-bg text-shopify-green">
          {icon}
        </span>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <strong className="text-2xl font-semibold">{value}</strong>
          <p
            className={`mt-2 flex items-center gap-1 text-xs font-semibold ${
              positive ? "text-shopify-green" : "text-shopify-red"
            }`}
          >
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}% {period}
          </p>
        </div>
        <div className="h-12 w-24">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Tooltip cursor={false} contentStyle={{ display: "none" }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={positive ? "#008060" : "#d72c0d"}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </article>
  );
}

export default memo(KPICard);
