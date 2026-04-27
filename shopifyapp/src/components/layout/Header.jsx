import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";

const titles = {
  "/dashboard": "Home",
  "/orders": "Orders",
  "/products": "Products",
  "/customers": "Customers",
  "/marketing": "Marketing",
  "/discounts": "Discounts",
  "/content": "Content",
  "/markets": "Markets",
  "/finance": "Finance",
  "/online-store": "Online Store",
  "/apps/search-discovery": "Search & Discovery",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export default function Header() {
  const { pathname } = useLocation();
  const { notificationCount, setMobileSidebarOpen, sidebarCollapsed } =
    useAppContext();
  const [profileOpen, setProfileOpen] = useState(false);
  const title = useMemo(() => {
    const matched = Object.keys(titles).find((path) => pathname.startsWith(path));
    if (pathname.includes("/orders/")) return "Order details";
    if (pathname.includes("/products/")) return "Product details";
    if (pathname.includes("/customers/")) return "Customer details";
    return titles[matched] || "Home";
  }, [pathname]);

  return (
    <header
      className={`fixed right-0 top-0 z-20 flex h-14 items-center gap-4 border-b border-shopify-border bg-white px-4 transition lg:px-6 ${
        sidebarCollapsed ? "lg:left-20" : "lg:left-60"
      } left-0`}
    >
      <button className="lg:hidden" onClick={() => setMobileSidebarOpen(true)}>
        <Menu size={22} />
      </button>
      <h1 className="min-w-[120px] text-xl font-semibold">{title}</h1>
      <label className="mx-auto hidden h-9 w-full max-w-xl items-center gap-2 rounded border border-shopify-border bg-shopify-bg px-3 text-shopify-secondary md:flex">
        <Search size={18} />
        <input
          className="w-full bg-transparent outline-none"
          type="search"
          placeholder="Search..."
        />
      </label>
      <div className="ml-auto flex items-center gap-2">
        <button className="grid h-9 w-9 place-items-center rounded hover:bg-shopify-bg">
          <HelpCircle size={19} />
        </button>
        <button className="relative grid h-9 w-9 place-items-center rounded hover:bg-shopify-bg">
          <Bell size={19} />
          {notificationCount > 0 ? (
            <span className="absolute right-1.5 top-1 h-2.5 w-2.5 rounded-full bg-shopify-red" />
          ) : null}
        </button>
        <div className="relative">
          <button
            className="grid h-9 w-9 place-items-center rounded-full bg-black text-sm font-bold tracking-normal text-zinc-400"
            onClick={() => setProfileOpen((value) => !value)}
          >
            LS
          </button>
          {profileOpen ? (
            <div className="card absolute right-0 top-11 w-52 overflow-hidden py-1">
              <button className="block w-full px-4 py-2 text-left hover:bg-shopify-bg">
                Profile
              </button>
              <button className="block w-full px-4 py-2 text-left hover:bg-shopify-bg">
                Account settings
              </button>
              <button className="block w-full px-4 py-2 text-left text-shopify-red hover:bg-shopify-bg">
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
