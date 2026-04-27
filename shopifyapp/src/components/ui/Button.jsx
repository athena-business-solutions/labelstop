import { forwardRef } from "react";

const variants = {
  primary:
    "border-shopify-green bg-shopify-green text-white hover:bg-shopify-green-hover",
  secondary:
    "border-shopify-border bg-white text-shopify-primary hover:bg-shopify-bg",
  danger: "border-shopify-red bg-shopify-red text-white hover:opacity-90",
  ghost:
    "border-transparent bg-transparent text-shopify-primary hover:bg-shopify-bg",
};

const Button = forwardRef(function Button(
  { children, className = "", variant = "secondary", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={`focus-ring inline-flex min-h-8 items-center justify-center gap-2 rounded border px-3 py-1.5 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
