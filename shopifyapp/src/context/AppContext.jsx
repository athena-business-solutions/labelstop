import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("7d");

  const storeName =
    process.env.REACT_APP_STORE_NAME ||
    import.meta.env.REACT_APP_STORE_NAME ||
    "Label Stop";

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px) and (max-width: 1024px)");
    const syncCollapsed = () => setSidebarCollapsed(media.matches);
    syncCollapsed();
    media.addEventListener("change", syncCollapsed);
    return () => media.removeEventListener("change", syncCollapsed);
  }, []);

  const value = useMemo(
    () => ({
      storeName,
      user: {
        name: "Label Stop",
        email: "admin@example.com",
        avatar: "",
      },
      notificationCount: 3,
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      selectedDateRange,
      setSelectedDateRange,
    }),
    [mobileSidebarOpen, selectedDateRange, sidebarCollapsed, storeName],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
