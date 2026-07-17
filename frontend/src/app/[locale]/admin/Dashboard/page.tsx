"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api/client";
import {
  ShoppingBag,
  Package,
  Activity,
  Clock,
  TrendingUp,
  Users,
  DollarSign,
  BarChart3,
  PieChart,
  Search,
  PackageSearch,
  Loader2,
} from "lucide-react";
import LocaleSwitcher from "@/components/shared/LocaleSwitcher";
import Chart from "chart.js/auto";

interface DashboardStats {
  retail: {
    orderCount: number;
    revenue: number;
  };
  custom: {
    orderCount: number;
    revenue: number;
  };
  currency: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pricing integration states
  const [pricingOrders, setPricingOrders] = useState<any[]>([]);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingSearch, setPricingSearch] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.get<DashboardStats>("/api/admin/dashboard");
        setStats(data);
        setError(null);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchPricingOrders = async () => {
      try {
        setPricingLoading(true);
        const data = await api.get<any>("/api/admin/orders/custom");
        const items = Array.isArray(data) ? data : data.items || [];
        setPricingOrders(items);
      } catch (err) {
        console.error("Pricing fetch error:", err);
      } finally {
        setPricingLoading(false);
      }
    };
    fetchPricingOrders();
  }, []);

  const getOrderFees = (order: any) => {
    if (order.items && order.items.length > 0) {
      const tailorFee = order.items.reduce((sum: number, item: any) => sum + (item.pricing?.designBase || 0), 0);
      const tailoringFee = order.items.reduce((sum: number, item: any) => sum + (item.pricing?.tailoringFee || 0), 0);
      const fabricFee = order.items.reduce((sum: number, item: any) => sum + (item.pricing?.fabricCost || 0), 0);
      return { tailorFee, tailoringFee, fabricFee };
    }
    return {
      tailorFee: order.pricing?.designBase || 0,
      tailoringFee: order.pricing?.tailoringFee || 0,
      fabricFee: order.pricing?.fabricCost || 0,
    };
  };

  const readPartnerName = (value: any, fallback: string) => {
    if (!value) return fallback;
    if (typeof value === "string") return value;
    return value.name || fallback;
  };

  const formatOrderDateLocal = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredPricingOrders = useMemo(() => {
    return pricingOrders.filter((order) => {
      if (pricingSearch.trim()) {
        const term = pricingSearch.toLowerCase();
        const customerName = readPartnerName(
          typeof order.userId === "object" ? order.userId : null,
          "",
        ).toLowerCase();
        const customerEmail = (
          typeof order.userId === "object" ? order.userId.email || "" : ""
        ).toLowerCase();
        const orderIdHex = order._id.toLowerCase();
        return (
          customerName.includes(term) ||
          customerEmail.includes(term) ||
          orderIdHex.includes(term)
        );
      }
      return true;
    });
  }, [pricingOrders, pricingSearch]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: stats?.currency || "AED",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Charts
  useEffect(() => {
    if (!stats) return;

    // Keep a stable currency for chart tooltips
    const currency = stats.currency || "AED";

    // Orders Bar Chart
    const ordersCanvas = document.getElementById(
      "orders-chart",
    ) as HTMLCanvasElement | null;
    // Revenue Line Chart
    const revenueCanvas = document.getElementById(
      "revenue-chart",
    ) as HTMLCanvasElement | null;
    // Orders Pie Chart
    const pieCanvas = document.getElementById(
      "pie-chart",
    ) as HTMLCanvasElement | null;

    if (!ordersCanvas || !revenueCanvas || !pieCanvas) return;

    let ordersChart: Chart | null = null;
    let revenueChart: Chart | null = null;
    let pieChart: Chart | null = null;

    const raf = requestAnimationFrame(() => {
      const gold = "#C9A84C";
      const goldLight = "rgba(201, 168, 76, 0.3)";
      const goldDark = "#A8893A";
      const black = "#000000";
      const white = "#FFFFFF";

      const formatCurrencyWith = (value: number) => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
          minimumFractionDigits: 0,
        }).format(value);
      };

      // Orders Bar Chart
      ordersChart = new Chart(ordersCanvas, {
        type: "bar",
        data: {
          labels: ["Retail", "Custom"],
          datasets: [
            {
              label: "Orders",
              data: [stats.retail.orderCount, stats.custom.orderCount],
              backgroundColor: [gold, goldLight],
              borderColor: [goldDark, gold],
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
              hoverBackgroundColor: [goldDark, gold],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 800, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: black,
              titleColor: white,
              bodyColor: white,
              borderColor: gold,
              borderWidth: 1,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: (ctx) => {
                  const y = ctx.parsed?.y;
                  const orders =
                    typeof y === "number"
                      ? y
                      : typeof ctx.raw === "number"
                        ? ctx.raw
                        : Number(ctx.raw);
                  return ` ${orders.toLocaleString()} orders`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: "#666",
                font: { family: "inherit", weight: 500 },
              },
              grid: { display: false },
              border: { color: "#E8E8E8" },
            },
            y: {
              beginAtZero: true,
              ticks: { color: "#666", font: { family: "inherit" } },
              grid: { color: "rgba(0,0,0,0.06)" },
              border: { color: "#E8E8E8" },
            },
          },
        },
      });

      // Revenue Line Chart
      revenueChart = new Chart(revenueCanvas, {
        type: "line",
        data: {
          labels: ["Retail", "Custom"],
          datasets: [
            {
              label: "Revenue",
              data: [stats.retail.revenue, stats.custom.revenue],
              borderColor: gold,
              backgroundColor: (ctx) => {
                const chartArea = ctx.chart.chartArea;
                const height =
                  chartArea?.bottom && chartArea?.top
                    ? chartArea.bottom - chartArea.top
                    : revenueCanvas.getBoundingClientRect().height || 250;

                const gradient = ctx.chart.ctx.createLinearGradient(
                  0,
                  0,
                  0,
                  height,
                );
                gradient.addColorStop(0, "rgba(201, 168, 76, 0.3)");
                gradient.addColorStop(1, "rgba(201, 168, 76, 0.02)");
                return gradient;
              },
              borderWidth: 3,
              tension: 0.4,
              pointRadius: 6,
              pointHoverRadius: 9,
              pointBackgroundColor: white,
              pointBorderColor: gold,
              pointBorderWidth: 3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 800, easing: "easeOutQuart" },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: black,
              titleColor: white,
              bodyColor: white,
              borderColor: gold,
              borderWidth: 1,
              padding: 12,
              displayColors: false,
              callbacks: {
                label: (ctx) => {
                  const y = ctx.parsed?.y;
                  const val =
                    typeof y === "number"
                      ? y
                      : typeof ctx.raw === "number"
                        ? ctx.raw
                        : Number(ctx.raw);
                  return ` ${formatCurrencyWith(val)}`;
                },
              },
            },
          },
          scales: {
            x: {
              ticks: {
                color: "#666",
                font: { family: "inherit", weight: 500 },
              },
              grid: { display: false },
              border: { color: "#E8E8E8" },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: "#666",
                font: { family: "inherit" },
                callback: (value) => {
                  const num = Number(value);
                  return num >= 1000 ? `${Math.round(num / 1000)}k` : `${num}`;
                },
              },
              grid: { color: "rgba(0,0,0,0.06)" },
              border: { color: "#E8E8E8" },
            },
          },
        },
      });

      // Pie Chart - Order Distribution
      pieChart = new Chart(pieCanvas, {
        type: "doughnut",
        data: {
          labels: ["Retail", "Custom"],
          datasets: [
            {
              data: [stats.retail.orderCount, stats.custom.orderCount],
              backgroundColor: [gold, goldLight],
              borderColor: [white, white],
              borderWidth: 3,
              hoverBackgroundColor: [goldDark, gold],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "70%",
          animation: { duration: 800, easing: "easeOutQuart" },
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
                usePointStyle: true,
                pointStyle: "circle",
                font: { family: "inherit", size: 12 },
                color: "#333",
              },
            },
            tooltip: {
              backgroundColor: black,
              titleColor: white,
              bodyColor: white,
              borderColor: gold,
              borderWidth: 1,
              padding: 12,
              callbacks: {
                label: (ctx) => {
                  const total = (ctx.dataset.data as number[]).reduce(
                    (a, b) => a + b,
                    0,
                  );
                  const parsed =
                    typeof ctx.parsed === "number"
                      ? ctx.parsed
                      : Number(ctx.parsed);
                  const percentage =
                    total > 0 ? ((parsed / total) * 100).toFixed(1) : "0.0";
                  return ` ${ctx.label}: ${parsed} orders (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    });

    return () => {
      cancelAnimationFrame(raf);
      ordersChart?.destroy();
      revenueChart?.destroy();
      pieChart?.destroy();
    };
  }, [stats]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-100 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm p-6 h-32 overflow-hidden"
              >
                <div className="h-3 w-36 bg-gray-200 rounded mb-4" />
                <div className="h-8 w-28 bg-gray-200/70 rounded mb-3" />
                <div className="h-3 w-24 bg-gray-200 rounded" />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {[...Array(2)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-sm p-6 h-80 overflow-hidden"
              >
                <div className="h-4 w-28 bg-gray-200/70 rounded mb-5" />
                <div className="h-56 w-full bg-gray-200/70 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <Activity className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="font-normal text-xl text-black">
            Unable to load dashboard
          </p>
          <p className="text-gray-500 mt-2 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const { retail, custom } = stats;
  const totalOrders = retail.orderCount + custom.orderCount;
  const totalRevenue = retail.revenue + custom.revenue;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-light text-black tracking-tight">
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Welcome back,{" "}
            <span className="text-black font-medium">
              {user?.name?.split(" ")[0] || "Admin"}
            </span>
          </p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <LocaleSwitcher />
          <div className="text-xs text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Orders
              </p>
              <p className="text-3xl font-light text-black mt-2">
                {totalOrders.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">+12% this month</p>
            </div>
            <div className="p-3 bg-[#C9A84C]/10 rounded-xl">
              <ShoppingBag
                className="w-5 h-5 text-[#C9A84C]"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Total Revenue
              </p>
              <p className="text-3xl font-light text-black mt-2">
                {formatCurrency(totalRevenue)}
              </p>
              <p className="text-xs text-gray-400 mt-1">+8% this month</p>
            </div>
            <div className="p-3 bg-[#C9A84C]/10 rounded-xl">
              <DollarSign
                className="w-5 h-5 text-[#C9A84C]"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Retail Orders
              </p>
              <p className="text-3xl font-light text-black mt-2">
                {retail.orderCount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">
                {formatCurrency(retail.revenue)} revenue
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <Package className="w-5 h-5 text-black" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Custom Orders
              </p>
              <p className="text-3xl font-light text-black mt-2">
                {custom.orderCount.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1 whitespace-nowrap">
                {formatCurrency(custom.revenue)} revenue
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <Users className="w-5 h-5 text-black" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Bar Chart */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-black uppercase tracking-wider">
                Orders
              </h3>
            </div>
          </div>
          <div className="relative h-56 sm:h-64 lg:h-60 xl:h-64 2xl:h-72 overflow-hidden">
            <canvas
              id="orders-chart"
              className="w-full h-full"
              aria-label="Orders chart"
            />
          </div>
        </div>

        {/* Revenue Line Chart */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <TrendingUp
                className="w-4 h-4 text-[#C9A84C]"
                strokeWidth={1.5}
              />
              <h3 className="text-sm font-medium text-black uppercase tracking-wider">
                Revenue
              </h3>
            </div>
          </div>
          <div className="relative h-56 sm:h-64 lg:h-60 xl:h-64 2xl:h-72 overflow-hidden">
            <canvas
              id="revenue-chart"
              className="w-full h-full"
              aria-label="Revenue chart"
            />
          </div>
        </div>

        {/* Pie Chart - Distribution */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />
              <h3 className="text-sm font-medium text-black uppercase tracking-wider">
                Distribution
              </h3>
            </div>
          </div>
          <div className="relative h-56 sm:h-64 lg:h-60 xl:h-64 2xl:h-72 overflow-hidden">
            <canvas
              id="pie-chart"
              className="w-full h-full"
              aria-label="Orders distribution chart"
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Clock className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-black uppercase tracking-wider">
            Recent Activity
          </h3>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex flex-col items-center">
              <div className="w-2 h-2 bg-[#C9A84C] rounded-full mt-1.5"></div>
              <div className="w-px h-full bg-gray-200 mt-2"></div>
            </div>
            <div className="pb-4">
              <p className="text-sm text-black">
                New retail order <span className="font-mono">#100234</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Just now</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative flex flex-col items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5"></div>
              <div className="w-px h-full bg-gray-200 mt-2"></div>
            </div>
            <div className="pb-4">
              <p className="text-sm text-black">
                Tailor application:{" "}
                <span className="font-medium">Elegant Stitches</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">2 hours ago</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative flex flex-col items-center">
              <div className="w-2 h-2 bg-[#C9A84C] rounded-full mt-1.5"></div>
              <div className="w-px h-full bg-gray-200 mt-2"></div>
            </div>
            <div className="pb-4">
              <p className="text-sm text-black">
                Revenue milestone: {formatCurrency(totalRevenue)} reached
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Today</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="relative flex flex-col items-center">
              <div className="w-2 h-2 bg-gray-300 rounded-full mt-1.5"></div>
            </div>
            <div>
              <p className="text-sm text-black">
                Custom order completed:{" "}
                <span className="font-mono">#C-2024-089</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Yesterday</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Fees Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-50 p-6 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-black uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.5} />
              Pricing & Fees
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Consolidated breakdown of tailor fees, tailoring fees, and fabric costs per order.
            </p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search customer or order..."
              value={pricingSearch}
              onChange={(e) => setPricingSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:outline-none focus:border-black text-black bg-white transition"
            />
          </div>
        </div>

        {pricingLoading && pricingOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-black mb-3" />
            <p className="text-xs text-gray-400 uppercase tracking-widest font-mono">Loading data...</p>
          </div>
        ) : filteredPricingOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <PackageSearch className="w-12 h-12 text-gray-300 mb-3" strokeWidth={1} />
            <p className="text-xs text-gray-400">No orders found matching filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs text-gray-500">
              <thead className="bg-gray-50/70 text-[9px] uppercase tracking-wider text-gray-400 font-semibold border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Tailor Fee</th>
                  <th className="px-4 py-3">Tailoring Fee</th>
                  <th className="px-4 py-3">Fabric Fee</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPricingOrders.map((order: any) => {
                  const customerName = readPartnerName(
                    typeof order.userId === "object" ? order.userId : null,
                    "Unknown Customer",
                  );
                  const { tailorFee, tailoringFee, fabricFee } = getOrderFees(order);
                  const orderTotal = tailorFee + tailoringFee + fabricFee;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-black text-2xs">
                        #{order._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-black block">
                          {customerName}
                        </span>
                        {typeof order.userId === "object" && (
                          <span className="text-3xs text-gray-400 block">
                            {order.userId.email}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-2xs">
                        {formatOrderDateLocal(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-black">
                        {formatCurrency(tailorFee)}
                      </td>
                      <td className="px-4 py-3 text-black">
                        {formatCurrency(tailoringFee)}
                      </td>
                      <td className="px-4 py-3 text-black">
                        {formatCurrency(fabricFee)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-black">
                        {formatCurrency(orderTotal)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-3xs font-medium bg-gray-100 text-gray-700 capitalize">
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
