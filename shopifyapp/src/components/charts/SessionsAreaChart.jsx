import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "../../utils/formatters";

export default function SessionsAreaChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sessionsFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#008060" stopOpacity={0.28} />
            <stop offset="100%" stopColor="#008060" stopOpacity={0.03} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e1e3e5" strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} width={72} />
        <Tooltip formatter={(value) => formatNumber(value)} />
        <Area
          type="monotone"
          dataKey="sessions"
          stroke="#008060"
          strokeWidth={3}
          fill="url(#sessionsFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
