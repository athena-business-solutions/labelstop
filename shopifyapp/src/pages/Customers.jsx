import { Download, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/Table";
import { useDebounce } from "../hooks/useDebounce";
import { useFetch } from "../hooks/useFetch";
import { endpoints } from "../services/api";
import { formatCurrency, formatDate } from "../utils/formatters";

export default function Customers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search);
  const page = Number(searchParams.get("page") || 1);

  useEffect(() => {
    setSearchParams({ page: String(page), limit: "20", search: debouncedSearch });
  }, [debouncedSearch, page, setSearchParams]);

  const query = useMemo(() => ({ page, limit: 20, search: debouncedSearch }), [debouncedSearch, page]);
  const customers = useFetch(endpoints.customers.list, query);
  const pagination = customers.data?.pagination || {};

  const columns = [
    { key: "name", header: "Customer Name" },
    { key: "email", header: "Email" },
    { key: "location", header: "Location" },
    { key: "orders", header: "Orders" },
    { key: "amountSpent", header: "Amount Spent", render: (row) => formatCurrency(row.amountSpent) },
    { key: "lastOrderDate", header: "Last Order Date", render: (row) => formatDate(row.lastOrderDate) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Customers</h1>
        <div className="flex gap-2">
          <Button><Download size={16} /> Export</Button>
          <Button variant="primary"><Plus size={16} /> Add customer</Button>
        </div>
      </div>
      <input className="focus-ring w-full rounded border border-shopify-border px-3 py-2" placeholder="Search customers" value={search} onChange={(event) => setSearch(event.target.value)} />
      <DataTable
        columns={columns}
        data={customers.data?.data || []}
        loading={customers.loading}
        selectable
        onRowClick={(row) => navigate(`/customers/${row.id}`)}
        pagination={{
          total: pagination.total || 0,
          page,
          limit: 20,
          onChange: (nextPage) => setSearchParams({ page: String(nextPage), limit: "20", search: debouncedSearch }),
        }}
      />
    </div>
  );
}
