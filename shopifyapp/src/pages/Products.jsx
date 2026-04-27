import {
  ArrowUpDown,
  Download,
  Filter,
  FolderKanban,
  HousePlus,
  Image as ImageIcon,
  MoreHorizontal,
  Plus,
  Search,
  Tag,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import DataTable from "../components/ui/Table";
import Skeleton from "../components/ui/Skeleton";
import { useDebounce } from "../hooks/useDebounce";
import { useFetch } from "../hooks/useFetch";
import { endpoints } from "../services/api";

const tabs = ["all", "active", "draft", "archived"];

function normalizeCollectionTokens(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeCollectionTokens(item))
      .filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
  }
  return [];
}

function buildCollectionRows(products) {
  const byCollection = new Map();

  for (const product of products) {
    const explicitCollections = normalizeCollectionTokens(product.collections);
    const tags = normalizeCollectionTokens(product.tags);
    const candidateNames = explicitCollections.length ? explicitCollections : tags;

    candidateNames.forEach((name) => {
      const key = name.toLowerCase();
      const current =
        byCollection.get(key) || {
          id: key,
          title: name,
          image: product.image || product.media?.[0]?.url || "",
          count: 0,
          condition: `Product tag is equal to ${name}`,
        };

      current.count += 1;
      if (!current.image) {
        current.image = product.image || product.media?.[0]?.url || "";
      }

      byCollection.set(key, current);
    });
  }

  return Array.from(byCollection.values()).sort((a, b) => a.title.localeCompare(b.title));
}

function buildInventoryRows(products) {
  return products.flatMap((product) => {
    const baseImage = product.image || product.media?.[0]?.url || "";
    const variants = Array.isArray(product.variants) && product.variants.length
      ? product.variants
      : [
          {
            id: `${product.id || product.name}-default`,
            title: product.variantTitle || product.size || "",
            sku: product.sku || "",
            inventory: product.inventory,
          },
        ];

    return variants.map((variant, index) => {
      const variantLabel = variant.title || variant.option1 || variant.name || "";
      const onHand = Number(variant.inventory ?? product.inventory ?? 0);
      const committed = Number(variant.committed ?? 0);
      const unavailable = Number(variant.unavailable ?? 0);
      const available = Math.max(onHand - committed - unavailable, 0);

      return {
        id: variant.id || `${product.id || product.name}-${index}`,
        name: product.name || product.title || "Untitled product",
        image: variant.image || baseImage,
        variantLabel,
        sku: variant.sku || product.sku || "",
        unavailable,
        committed,
        available,
        onHand,
      };
    });
  });
}

function CollectionsView({ products, loading, search, setSearch }) {
  const rows = useMemo(() => buildCollectionRows(products), [products]);

  if (loading && !rows.length) {
    return <Skeleton variant="table" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Tag className="text-[#303030]" size={22} />
          <h1 className="text-[28px] font-semibold tracking-tight text-[#202223]">Collections</h1>
        </div>
        <Button
          variant="primary"
          className="rounded-xl border-[#303030] bg-[#303030] px-4 py-2 text-[15px] hover:bg-black"
        >
          Add collection
        </Button>
      </div>

      <section className="overflow-hidden rounded-[22px] border border-[#dfe3e8] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="border-b border-[#eceef0] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-[#e8e9eb] px-4 py-2 text-[15px] font-semibold text-[#303030]">
                All
              </span>
              <button
                type="button"
                className="rounded-xl px-2 py-1 text-[28px] leading-none text-[#4a4a4a] hover:bg-[#f6f6f7]"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 rounded-xl border border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175]">
                <Search size={20} />
                <input
                  className="w-0 min-w-[160px] border-0 bg-transparent text-[15px] text-[#202223] outline-none placeholder:text-[#6d7175]"
                  placeholder="Search and filter"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <Button className="rounded-xl border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175] hover:bg-[#f6f6f7]">
                <MoreHorizontal size={18} />
              </Button>
              <Button className="rounded-xl border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175] hover:bg-[#f6f6f7]">
                <ArrowUpDown size={18} />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eceef0] text-[13px] font-semibold text-[#4a4a4a]">
                <th className="w-12 px-5 py-3">
                  <input type="checkbox" className="h-6 w-6 rounded-md border-[#aeb4b9]" />
                </th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3">Products</th>
                <th className="px-5 py-3">Product conditions</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#eceef0] text-[15px] text-[#202223] transition hover:bg-[#fafbfb]"
                  >
                    <td className="px-5 py-3">
                      <input type="checkbox" className="h-6 w-6 rounded-md border-[#aeb4b9]" />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-4">
                        <div className="grid h-14 w-14 place-items-center overflow-hidden rounded-2xl border border-[#eceef0] bg-white">
                          {row.image ? (
                            <img
                              src={row.image}
                              alt={row.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="text-[#8c9196]" size={24} />
                          )}
                        </div>
                        <span className="font-medium text-[#202223]">{row.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">{row.count}</td>
                    <td className="px-5 py-3 text-[#4a4a4a]">{row.condition}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="space-y-2">
                      <div className="text-base font-semibold text-[#202223]">
                        No collections found
                      </div>
                      <div className="text-sm text-[#6d7175]">
                        Add collection names or tags to products to populate this page.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function InventoryView({ products, loading, search, setSearch }) {
  const rows = useMemo(() => buildInventoryRows(products), [products]);

  if (loading && !rows.length) {
    return <Skeleton variant="table" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <HousePlus className="text-[#303030]" size={22} />
          <h1 className="text-[28px] font-semibold tracking-tight text-[#202223]">Inventory</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="rounded-xl border-[#d2d5d8] bg-[#f6f6f7] px-4 py-2 text-[15px] font-semibold text-[#303030] hover:bg-[#eceef0]">
            Export
          </Button>
          <Button className="rounded-xl border-[#d2d5d8] bg-[#f6f6f7] px-4 py-2 text-[15px] font-semibold text-[#303030] hover:bg-[#eceef0]">
            Import
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-[22px] border border-[#dfe3e8] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <div className="border-b border-[#eceef0] px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-2xl bg-[#e8e9eb] px-4 py-2 text-[15px] font-semibold text-[#303030]">
                All
              </span>
              <button
                type="button"
                className="rounded-xl px-2 py-1 text-[28px] leading-none text-[#4a4a4a] hover:bg-[#f6f6f7]"
              >
                +
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 rounded-xl border border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175]">
                <Search size={20} />
                <input
                  className="w-0 min-w-[160px] border-0 bg-transparent text-[15px] text-[#202223] outline-none placeholder:text-[#6d7175]"
                  placeholder="Search and filter"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <Button className="rounded-xl border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175] hover:bg-[#f6f6f7]">
                <MoreHorizontal size={18} />
              </Button>
              <Button className="rounded-xl border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175] hover:bg-[#f6f6f7]">
                <FolderKanban size={18} />
              </Button>
              <Button className="rounded-xl border-[#dfe3e8] bg-white px-3 py-2 text-[#6d7175] hover:bg-[#f6f6f7]">
                <ArrowUpDown size={18} />
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#eceef0] text-[13px] font-semibold text-[#4a4a4a]">
                <th className="w-12 px-5 py-3">
                  <input type="checkbox" className="h-6 w-6 rounded-md border-[#aeb4b9]" />
                </th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">
                  <span className="border-b border-dotted border-[#8c9196] pb-1">Unavailable</span>
                </th>
                <th className="px-5 py-3">
                  <span className="border-b border-dotted border-[#8c9196] pb-1">Committed</span>
                </th>
                <th className="px-5 py-3">
                  <span className="border-b border-dotted border-[#8c9196] pb-1">Available</span>
                </th>
                <th className="px-5 py-3">
                  <span className="border-b border-dotted border-[#8c9196] pb-1">On hand</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#eceef0] text-[15px] text-[#202223] transition hover:bg-[#fafbfb]"
                  >
                    <td className="px-5 py-3">
                      <input type="checkbox" className="h-6 w-6 rounded-md border-[#aeb4b9]" />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-4">
                        <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-[#eceef0] bg-white">
                          {row.image ? (
                            <img
                              src={row.image}
                              alt={row.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="text-[#8c9196]" size={24} />
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="max-w-[380px] font-semibold leading-8 text-[#303030]">
                            {row.name}
                          </div>
                          {row.variantLabel ? (
                            <span className="inline-flex rounded-full bg-[#e8e9eb] px-3 py-1 text-sm text-[#4a4a4a]">
                              {row.variantLabel}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-[#6d7175]">{row.sku || "No SKU"}</td>
                    <td className="px-5 py-3 text-center">{row.unavailable}</td>
                    <td className="px-5 py-3 text-center">{row.committed}</td>
                    <td className="px-5 py-3">
                      <input
                        className="h-12 w-[150px] rounded-2xl border border-[#aeb4b9] bg-white px-4 text-[15px] text-[#202223] outline-none"
                        defaultValue={row.available}
                      />
                    </td>
                    <td className="px-5 py-3">
                      <input
                        className="h-12 w-[150px] rounded-2xl border border-[#aeb4b9] bg-white px-4 text-[15px] text-[#202223] outline-none"
                        defaultValue={row.onHand}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center">
                    <div className="space-y-2">
                      <div className="text-base font-semibold text-[#202223]">
                        No inventory items found
                      </div>
                      <div className="text-sm text-[#6d7175]">
                        Add products or variants to populate inventory here.
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function Products() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search);
  const page = Number(searchParams.get("page") || 1);
  const status = searchParams.get("status") || "all";
  const sort = searchParams.get("sort") || "";
  const view = searchParams.get("view") || "";
  const isCollectionsView = view === "collections";
  const isInventoryView = view === "inventory";

  useEffect(() => {
    const next = {
      page: String(page),
      limit: "20",
      status,
      search: debouncedSearch,
      sort,
    };

    if (view) {
      next.view = view;
    }

    setSearchParams(next);
  }, [debouncedSearch, page, setSearchParams, sort, status, view]);

  const query = useMemo(
    () => ({
      page,
      limit: isCollectionsView || isInventoryView ? 250 : 20,
      status,
      search: debouncedSearch,
      sort,
    }),
    [debouncedSearch, isCollectionsView, isInventoryView, page, sort, status],
  );
  const products = useFetch(endpoints.products.list, query);
  const pagination = products.data?.pagination || {};

  function updateParam(key, value) {
    const next = Object.fromEntries(searchParams);

    if (value) {
      next[key] = value;
    } else {
      delete next[key];
    }

    next.page = "1";
    setSearchParams(next);
  }

  if (isCollectionsView) {
    return (
      <CollectionsView
        products={products.data?.data || []}
        loading={products.loading}
        search={search}
        setSearch={setSearch}
      />
    );
  }

  if (isInventoryView) {
    return (
      <InventoryView
        products={products.data?.data || []}
        loading={products.loading}
        search={search}
        setSearch={setSearch}
      />
    );
  }

  const columns = [
    {
      key: "product",
      header: "Product",
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img className="h-10 w-10 rounded object-cover" src={row.image} alt={row.name} />
          ) : null}
          <span className="font-semibold">{row.name}</span>
        </div>
      ),
    },
    { key: "status", header: "Status", render: (row) => <Badge status={row.status} /> },
    {
      key: "inventory",
      header: "Inventory",
      render: (row) => (
        <span className={Number(row.inventory) <= 0 ? "text-shopify-red" : ""}>
          {Number(row.inventory) <= 0 ? "Out of stock" : `${row.inventory} in stock`}
        </span>
      ),
    },
    { key: "type", header: "Type" },
    { key: "vendor", header: "Vendor" },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => navigate(`/products/${row.id}`)}>
            Edit
          </Button>
          <Button variant="ghost">Duplicate</Button>
          <Button variant="ghost">Archive</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Products</h1>
        <div className="flex flex-wrap gap-2">
          <Button>
            <Upload size={16} /> Import
          </Button>
          <Button>
            <Download size={16} /> Export
          </Button>
          <Button variant="primary">
            <Plus size={16} /> Add product
          </Button>
        </div>
      </div>

      <div className="card p-3">
        <div className="mb-3 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`rounded px-3 py-1.5 text-sm font-semibold capitalize ${
                status === tab ? "bg-shopify-green text-white" : "hover:bg-shopify-bg"
              }`}
              onClick={() => updateParam("status", tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <input
            className="rounded border border-shopify-border px-3 py-2"
            placeholder="Search products"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button>
            <Filter size={16} /> Filter
          </Button>
          <select
            className="rounded border border-shopify-border px-3 py-2"
            value={sort}
            onChange={(event) => updateParam("sort", event.target.value)}
          >
            <option value="">Sort</option>
            <option value="title">Title</option>
            <option value="created">Created</option>
            <option value="inventory">Inventory</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={products.data?.data || []}
        loading={products.loading}
        selectable
        onRowClick={(row) => navigate(`/products/${row.id}`)}
        pagination={{
          total: pagination.total || 0,
          page,
          limit: 20,
          onChange: (nextPage) => updateParam("page", String(nextPage)),
        }}
      />
    </div>
  );
}
