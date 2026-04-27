import { Send } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";

export default function Marketing() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Marketing</h1>
        <Button variant="primary" onClick={() => toast.success("Campaign draft created")}>
          <Send size={16} /> Create campaign
        </Button>
      </div>
      <section className="card p-5">
        <h2 className="mb-2 text-base font-semibold">Campaigns</h2>
        <p className="text-shopify-secondary">
          Connect your backend campaign endpoints here to list, create, and track marketing activity.
        </p>
      </section>
    </div>
  );
}
