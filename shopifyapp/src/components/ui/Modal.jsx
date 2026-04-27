import { X } from "lucide-react";
import Button from "./Button";

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <section className="card w-full max-w-xl overflow-hidden">
        <header className="flex items-center justify-between border-b border-shopify-border px-5 py-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </Button>
        </header>
        <div className="p-5">{children}</div>
      </section>
    </div>
  );
}
