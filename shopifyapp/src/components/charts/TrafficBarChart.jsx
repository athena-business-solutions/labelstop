import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber } from "../../utils/formatters";

export default function TrafficBarChart({ data = [], horizontal = false }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 16, left: horizontal ? 52 : 0, bottom: 0 }}
      >
        <CartesianGrid stroke="#e1e3e5" strokeDasharray="3 3" />
        {horizontal ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
          </>
        )}
        <Tooltip formatter={(value) => formatNumber(value)} />
        <Bar dataKey="value" fill="#006fbb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
