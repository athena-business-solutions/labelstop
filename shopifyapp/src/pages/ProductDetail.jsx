import { ArrowLeft, Save, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { useFetch } from "../hooks/useFetch";
import api, { endpoints } from "../services/api";

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-shopify-red">{error}</span> : null}
    </label>
  );
}

function inputClass(error) {
  return `focus-ring w-full rounded border px-3 py-2 ${
    error ? "border-shopify-red" : "border-shopify-border"
  }`;
}

export default function ProductDetail() {
  const { id } = useParams();
  const isNew = id === "new";
  const product = useFetch(isNew ? null : endpoints.products.detail(id), {}, { toastOnError: false });
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product.data?.data) setForm(product.data.data);
  }, [product.data]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.title) nextErrors.title = "Title is required";
    if (!form.price) nextErrors.price = "Price is required";
    if (!form.status) nextErrors.status = "Status is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function saveProduct(event) {
    event.preventDefault();
    if (!validate()) return;

    try {
      if (isNew) {
        await api.post(endpoints.products.list, form);
      } else {
        await api.put(endpoints.products.detail(id), form);
      }
      toast.success("Product saved successfully");
    } catch (error) {
      toast.error(error.message);
    }
  }

  if (!isNew && product.loading) return <Skeleton variant="chart" />;

  return (
    <form className="space-y-5" onSubmit={saveProduct}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link className="inline-flex items-center gap-2 font-semibold text-shopify-green" to="/products">
          <ArrowLeft size={18} /> Products
        </Link>
        <Button variant="primary" type="submit">
          <Save size={16} /> Save
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,65fr)_minmax(320px,35fr)]">
        <div className="space-y-5">
          <section className="card space-y-4 p-5">
            <Field label="Title" error={errors.title}>
              <input className={inputClass(errors.title)} value={form.title || ""} onChange={(event) => updateField("title", event.target.value)} />
            </Field>
            <Field label="Description">
              <textarea className={inputClass()} rows={7} value={form.description || ""} onChange={(event) => updateField("description", event.target.value)} />
            </Field>
          </section>

          <section className="card p-5">
            <h2 className="mb-4 text-base font-semibold">Media</h2>
            <div className="grid min-h-32 place-items-center rounded border border-dashed border-shopify-border bg-shopify-bg p-6 text-center">
              <div>
                <UploadCloud className="mx-auto mb-2 text-shopify-secondary" />
                <p className="font-semibold">Drag and drop images to upload</p>
                <input className="mt-3" type="file" multiple />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {(form.media || []).map((item) => (
                <img key={item.id || item.url} className="h-20 w-20 rounded object-cover" src={item.url} alt={item.alt || form.title} />
              ))}
            </div>
          </section>

          <section className="card grid gap-4 p-5 md:grid-cols-3">
            <Field label="Price" error={errors.price}>
              <input className={inputClass(errors.price)} type="number" value={form.price || ""} onChange={(event) => updateField("price", event.target.value)} />
            </Field>
            <Field label="Compare-at price">
              <input className={inputClass()} type="number" value={form.compareAtPrice || ""} onChange={(event) => updateField("compareAtPrice", event.target.value)} />
            </Field>
            <Field label="Cost per item">
              <input className={inputClass()} type="number" value={form.costPerItem || ""} onChange={(event) => updateField("costPerItem", event.target.value)} />
            </Field>
          </section>

          <section className="card grid gap-4 p-5 md:grid-cols-2">
            <Field label="SKU">
              <input className={inputClass()} value={form.sku || ""} onChange={(event) => updateField("sku", event.target.value)} />
            </Field>
            <Field label="Barcode">
              <input className={inputClass()} value={form.barcode || ""} onChange={(event) => updateField("barcode", event.target.value)} />
            </Field>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={Boolean(form.trackQuantity)} onChange={(event) => updateField("trackQuantity", event.target.checked)} />
              Track quantity
            </label>
            <Field label="Quantity">
              <input className={inputClass()} type="number" value={form.quantity || ""} onChange={(event) => updateField("quantity", event.target.value)} />
            </Field>
          </section>

          <section className="card grid gap-4 p-5 md:grid-cols-4">
            <Field label="Weight">
              <input className={inputClass()} value={form.weight || ""} onChange={(event) => updateField("weight", event.target.value)} />
            </Field>
            <Field label="Length">
              <input className={inputClass()} value={form.length || ""} onChange={(event) => updateField("length", event.target.value)} />
            </Field>
            <Field label="Width">
              <input className={inputClass()} value={form.width || ""} onChange={(event) => updateField("width", event.target.value)} />
            </Field>
            <Field label="Height">
              <input className={inputClass()} value={form.height || ""} onChange={(event) => updateField("height", event.target.value)} />
            </Field>
          </section>
        </div>

        <div className="space-y-5">
          <section className="card space-y-4 p-5">
            <Field label="Status" error={errors.status}>
              <select className={inputClass(errors.status)} value={form.status || ""} onChange={(event) => updateField("status", event.target.value)}>
                <option value="">Select status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </Field>
          </section>
          <section className="card space-y-4 p-5">
            <h2 className="text-base font-semibold">Product organization</h2>
            {["type", "vendor", "collections", "tags"].map((field) => (
              <Field key={field} label={field}>
                <input className={inputClass()} value={form[field] || ""} onChange={(event) => updateField(field, event.target.value)} />
              </Field>
            ))}
          </section>
          <section className="card space-y-3 p-5">
            <h2 className="text-base font-semibold">Sales channels</h2>
            {["Online Store", "POS"].map((channel) => (
              <label key={channel} className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                {channel}
              </label>
            ))}
          </section>
        </div>
      </div>
    </form>
  );
}
