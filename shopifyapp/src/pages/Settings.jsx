import { Save } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import { useAppContext } from "../context/AppContext";

export default function Settings() {
  const { storeName, user } = useAppContext();
  const [form, setForm] = useState({ storeName, email: user.email });
  const [errors, setErrors] = useState({});

  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.storeName) nextErrors.storeName = "Store name is required";
    if (!form.email) nextErrors.email = "Email is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) toast.success("Settings validated");
  }

  return (
    <form className="max-w-3xl space-y-5" onSubmit={submit}>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Settings</h1>
        <Button variant="primary" type="submit">
          <Save size={16} /> Save
        </Button>
      </div>
      <section className="card space-y-4 p-5">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Store name</span>
          <input
            className={`w-full rounded border px-3 py-2 ${errors.storeName ? "border-shopify-red" : "border-shopify-border"}`}
            value={form.storeName}
            onChange={(event) => setForm((current) => ({ ...current, storeName: event.target.value }))}
          />
          {errors.storeName ? <span className="text-xs text-shopify-red">{errors.storeName}</span> : null}
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">Account email</span>
          <input
            className={`w-full rounded border px-3 py-2 ${errors.email ? "border-shopify-red" : "border-shopify-border"}`}
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          {errors.email ? <span className="text-xs text-shopify-red">{errors.email}</span> : null}
        </label>
      </section>
    </form>
  );
}
