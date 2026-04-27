import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Skeleton from "./components/ui/Skeleton";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Orders = lazy(() => import("./pages/Orders"));
const OrderDetail = lazy(() => import("./pages/OrderDetail"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Customers = lazy(() => import("./pages/Customers"));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Marketing = lazy(() => import("./pages/Marketing"));
const Discounts = lazy(() => import("./pages/Discounts"));
const Content = lazy(() => import("./pages/Content"));
const Markets = lazy(() => import("./pages/Markets"));
const Finance = lazy(() => import("./pages/Finance"));
const OnlineStore = lazy(() => import("./pages/OnlineStore"));
const SearchDiscovery = lazy(() => import("./pages/SearchDiscovery"));
const Settings = lazy(() => import("./pages/Settings"));

export default function App() {
  return (
    <>
      <Layout>
        <Suspense fallback={<Skeleton variant="chart" />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerDetail />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/marketing" element={<Marketing />} />
            <Route path="/discounts" element={<Discounts />} />
            <Route path="/content" element={<Content />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/finance" element={<Finance />} />
            <Route path="/online-store" element={<OnlineStore />} />
            <Route path="/apps/search-discovery" element={<SearchDiscovery />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </Layout>
      <Toaster
        position="top-right"
        toastOptions={{
          success: { style: { borderLeft: "4px solid #008060" } },
          error: { style: { borderLeft: "4px solid #d72c0d" } },
        }}
      />
    </>
  );
}
