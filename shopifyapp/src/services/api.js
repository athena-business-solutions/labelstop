import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_BASE_URL ||
  import.meta.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error) || error.code === "ERR_CANCELED") {
      return Promise.reject(error);
    }

    const message =
      error.response?.data?.message ||
      (!error.response ? "Unable to reach the API server" : error.message) ||
      "Request failed";
    const requestError = new Error(message);
    requestError.code = error.code;
    requestError.status = error.response?.status;
    requestError.isNetworkError = !error.response;
    return Promise.reject(requestError);
  },
);

export const endpoints = {
  dashboard: {
    stats: "/dashboard/stats",
    salesChart: "/dashboard/sales-chart",
    channels: "/dashboard/channels",
    sessions: "/dashboard/sessions",
    recentOrders: "/dashboard/recent-orders",
    topProducts: "/dashboard/top-products",
  },
  orders: {
    list: "/orders",
    detail: (id) => `/orders/${id}`,
    fulfill: (id) => `/orders/${id}/fulfill`,
  },
  products: {
    list: "/products",
    detail: (id) => `/products/${id}`,
  },
  customers: {
    list: "/customers",
    detail: (id) => `/customers/${id}`,
  },
  analytics: {
    sales: "/analytics/sales",
    sessions: "/analytics/sessions",
    devices: "/analytics/devices",
    sources: "/analytics/sources",
    geography: "/analytics/geography",
    topProducts: "/analytics/top-products",
  },
};

export default api;
