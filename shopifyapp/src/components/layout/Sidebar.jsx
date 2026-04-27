import {
  BarChart3,
  ChevronDown,
  ChevronsRight,
  CornerDownRight,
  Home,
  Megaphone,
  MonitorPlay,
  Percent,
  Settings,
  ShoppingCart,
  Tag,
  Store,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import labelstopLogo from "../../assets/labelstop-logo.avif";
import { useAppContext } from "../../context/AppContext";
import { useFetch } from "../../hooks/useFetch";
import { endpoints } from "../../services/api";

const navItems = [
  { label: "Home", to: "/dashboard", icon: Home },
  {
    label: "Orders",
    to: "/orders",
    icon: ShoppingCart,
    count: true,
    children: [
      { label: "Drafts", to: "/orders?status=draft" },
      { label: "Shipping labels", to: "/orders?status=shipping-labels" },
      { label: "Abandoned checkouts", to: "/orders?status=abandoned" },
    ],
  },
  {
    label: "Products",
    to: "/products",
    icon: Tag,
    children: [
      { label: "Collections", to: "/products?view=collections" },
      { label: "Inventory", to: "/products?view=inventory" },
      { label: "Purchase orders", to: "/products?view=purchase-orders" },
      { label: "Transfers", to: "/products?view=transfers", disabled: true },
      { label: "Gift cards", to: "/products?view=gift-cards" },
    ],
  },
  {
    label: "Customers",
    to: "/customers",
    icon: Users,
    children: [
      { label: "Segments", to: "/customers?view=segments" },
      { label: "Companies", to: "/customers?view=companies", disabled: true },
    ],
  },
  {
    label: "Marketing",
    to: "/marketing",
    icon: Megaphone,
    children: [
      { label: "Campaigns", to: "/marketing?view=campaigns", disabled: true },
      { label: "Attribution", to: "/marketing?view=attribution" },
      { label: "Automations", to: "/marketing?view=automations" },
    ],
  },
  { label: "Discounts", to: "/discounts", icon: Percent },
  {
    label: "Content",
    to: "/content",
    icon: MonitorPlay,
    children: [
      { label: "Metaobjects", to: "/content?view=metaobjects" },
      { label: "Files", to: "/content?view=files" },
      { label: "Menus", to: "/content?view=menus" },
      { label: "Blog posts", to: "/content?view=blog-posts" },
    ],
  },
  {
    label: "Analytics",
    to: "/analytics",
    icon: BarChart3,
    children: [
      { label: "Reports", to: "/analytics?view=reports" },
      { label: "Live View", to: "/analytics?view=live-view" },
    ],
  },
];

const salesChannelItems = [
  {
    label: "Online Store",
    to: "/online-store",
    icon: Store,
    children: [
      { label: "Themes", to: "/online-store?view=themes" },
      { label: "Pages", to: "/online-store?view=pages" },
      { label: "Preferences", to: "/online-store?view=preferences" },
    ],
  },
];

export default function Sidebar() {
  const { pathname, search } = useLocation();
  const {
    storeName,
    sidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useAppContext();
  const orderCount = useFetch(
    endpoints.orders.list,
    { page: 1, limit: 1, status: "all" },
    { toastOnError: false },
  );
  const totalOrders = orderCount.data?.pagination?.total;
  const [openSections, setOpenSections] = useState({});

  const widthClass = sidebarCollapsed ? "lg:w-20" : "lg:w-60";

  useEffect(() => {
    setOpenSections((current) => {
      const next = { ...current };
      for (const item of [...navItems, ...salesChannelItems]) {
        if (!item.children) continue;
        const matchesChild = item.children.some(
          (child) => `${pathname}${search}` === child.to,
        );
        const matchesParent = pathname.startsWith(item.to);
        if (matchesParent || matchesChild) next[item.to] = true;
      }
      return next;
    });
  }, [pathname, search]);

  function toggleSection(sectionKey) {
    setOpenSections((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  }

  function renderChildLinks(children) {
    return (
      <div className="relative mb-1 mt-0.5 space-y-0.5 pl-10">
        <span className="absolute bottom-2 left-[22px] top-0 w-px bg-[#c7c7c7]" />
        <div className="space-y-0.5">
          {children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              onClick={() => setMobileSidebarOpen(false)}
              className={({ isActive }) =>
                `relative flex min-h-8 items-center gap-2 rounded-lg py-1.5 pl-3 pr-3 text-left text-[13px] font-medium text-[#616161] outline-none transition hover:bg-[#e3e3e3] hover:text-[#303030] focus-visible:ring-2 focus-visible:ring-[#303030] focus-visible:ring-inset ${
                  isActive ? "bg-[#e3e3e3] text-[#303030]" : ""
                } ${child.disabled ? "text-[#8a8a8a] hover:bg-transparent hover:text-[#8a8a8a]" : ""}`
              }
            >
              <CornerDownRight className="shrink-0 text-[#a0a0a0]" size={15} />
              {child.label}
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-black/40 lg:hidden ${
          mobileSidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setMobileSidebarOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 -translate-x-full flex-col overflow-hidden border-r border-[#d4d4d4] bg-[#f1f1f1] text-[#303030] shadow-[1px_0_0_rgba(0,0,0,0.05)] transition lg:translate-x-0 ${widthClass} ${
          mobileSidebarOpen ? "translate-x-0" : ""
        }`}
      >
        <div className="flex h-14 items-center justify-between px-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-black text-sm font-bold tracking-normal text-zinc-400">
              LS
            </span>
            {!sidebarCollapsed ? (
              <button className="flex min-w-0 items-center gap-2 rounded-md px-1 py-1 hover:bg-[#e3e3e3]">
                <img
                  src={labelstopLogo}
                  alt={storeName}
                  className="h-7 w-auto max-w-[150px] object-contain"
                />
                <ChevronDown className="text-[#616161]" size={16} />
              </button>
            ) : null}
          </div>
          <button
            className="rounded-md p-1 text-[#616161] hover:bg-[#e3e3e3] lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {navItems.map((item) => (
            <div key={item.to}>
              {item.children ? (
                <button
                  type="button"
                  onClick={() => toggleSection(item.to)}
                  className={`relative flex min-h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition hover:bg-[#e3e3e3] ${
                    pathname.startsWith(item.to)
                      ? "bg-white text-[#202223]"
                      : "text-[#303030]"
                  }`}
                >
                  <item.icon className="shrink-0 text-[#303030]" size={20} />
                  {!sidebarCollapsed ? <span>{item.label}</span> : null}
                  {item.count && !sidebarCollapsed && totalOrders ? (
                    <span className="ml-auto rounded-full bg-[#e3e3e3] px-2 py-0.5 text-xs font-semibold text-[#616161]">
                      {totalOrders}
                    </span>
                  ) : null}
                </button>
              ) : (
                <NavLink
                  to={item.to}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={({ isActive }) =>
                    `relative flex min-h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition hover:bg-[#e3e3e3] ${
                      isActive
                        ? "bg-white text-[#202223]"
                        : "text-[#303030]"
                    }`
                  }
                >
                  <item.icon className="shrink-0 text-[#303030]" size={20} />
                  {!sidebarCollapsed ? <span>{item.label}</span> : null}
                </NavLink>
              )}
              {item.children && !sidebarCollapsed && openSections[item.to]
                ? renderChildLinks(item.children)
                : null}
            </div>
          ))}

          {!sidebarCollapsed ? (
            <>
              <div className="px-3 pb-1 pt-3 text-[13px] font-semibold text-[#444]">
                <button
                  type="button"
                  className="flex items-center gap-1 text-left"
                  onClick={() => toggleSection("sales-channels")}
                >
                  <span>Sales channels</span>
                  <ChevronsRight className="text-[#666]" size={14} />
                </button>
              </div>

              {openSections["sales-channels"] !== false ? (
                <div className="space-y-0.5">
                  {salesChannelItems.map((item) => (
                    <div key={item.to}>
                      <button
                        type="button"
                        onClick={() => toggleSection(item.to)}
                        className={`relative flex min-h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition hover:bg-[#e3e3e3] ${
                          pathname.startsWith(item.to)
                            ? "bg-white text-[#202223]"
                            : "text-[#303030]"
                        }`}
                      >
                        <item.icon className="shrink-0 text-[#303030]" size={20} />
                        <span>{item.label}</span>
                      </button>
                      {item.children && openSections[item.to]
                        ? renderChildLinks(item.children)
                        : null}
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          ) : null}
        </nav>

        <div className="px-2 py-3">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `relative flex min-h-9 items-center gap-3 rounded-lg px-3 text-[13px] font-semibold transition hover:bg-[#e3e3e3] ${
                isActive
                  ? "bg-[#e3e3e3] text-[#202223] before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-1 before:rounded-r before:bg-[#008060]"
                  : "text-[#303030]"
              }`
            }
          >
            <Settings className="shrink-0 text-[#616161]" size={20} />
            {!sidebarCollapsed ? <span>Settings</span> : null}
          </NavLink>
        </div>
      </aside>
    </>
  );
}
