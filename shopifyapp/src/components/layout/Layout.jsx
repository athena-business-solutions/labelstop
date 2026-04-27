import Sidebar from "./Sidebar";
import Header from "./Header";
import { useAppContext } from "../../context/AppContext";

export default function Layout({ children }) {
  const { sidebarCollapsed } = useAppContext();

  return (
    <div className="min-h-screen bg-shopify-bg">
      <Sidebar />
      <Header />
      <main
        className={`min-h-screen pt-14 transition ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-60"
        }`}
      >
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
