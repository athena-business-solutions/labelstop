import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";

export default function Discounts() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Discounts</h1>
        <Button variant="primary" onClick={() => toast.success("Discount form opened")}>
          <Plus size={16} /> Create discount
        </Button>
      </div>
      <section className="card p-5">
        <h2 className="mb-2 text-base font-semibold">Discount codes</h2>
        <p className="text-shopify-secondary">
          Add your backend discount endpoints to manage automatic discounts and discount codes.
        </p>
      </section>
    </div>
  );
}
