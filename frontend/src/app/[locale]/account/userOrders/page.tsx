"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { Search, X, Filter } from "lucide-react";

type RetailOrderStatus =
    | "pending"
    | "confirmed"
    | "shipped"
    | "delivered"
    | "cancelled";

type RetailOrderItem = {
    name: string;
    image?: string;
};

type RetailOrder = {
    id: string;
    _id?: string;
    date: string;
    createdAt?: string;
    status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
    totalPrice: number;
    currency: string;
    firstItem?: {
        name: string;
        image?: string;
        size?: string;
    };
    items?: RetailOrderItem[];
};

const statusStyles: Record<RetailOrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
};

const statusOptions: { value: RetailOrderStatus | "all"; label: string }[] = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
];

export default function UserOrders() {
    const router = useRouter();

    const [orders, setOrders] = useState<RetailOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<RetailOrderStatus | "all">("all");
    const [minPrice, setMinPrice] = useState<number | "">("");
    const [maxPrice, setMaxPrice] = useState<number | "">("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await api.get("/api/orders/retail/mine");

                const normalizedOrders: RetailOrder[] =
                    Array.isArray(res)
                        ? res
                        : res?.orders ||
                        res?.data ||
                        res?.result?.orders ||
                        [];

                setOrders(normalizedOrders);
            } catch (err: any) {
                console.log("ORDER FETCH ERROR:", err);
                setError(err?.message || "Failed to load orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Filter logic
    const filteredOrders = orders.filter((order) => {
        // Search by product name (firstItem name or any item name)
        const productNameMatch = searchTerm === "" ||
            order.firstItem?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.items?.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!productNameMatch) return false;

        // Status filter
        if (statusFilter !== "all" && order.status !== statusFilter) return false;

        // Price range
        if (minPrice !== "" && order.totalPrice < minPrice) return false;
        if (maxPrice !== "" && order.totalPrice > maxPrice) return false;

        // Date range
        const orderDate = new Date(order.date || order.createdAt || "");
        if (startDate && orderDate < new Date(startDate)) return false;
        if (endDate && orderDate > new Date(endDate)) return false;

        return true;
    });

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setMinPrice("");
        setMaxPrice("");
        setStartDate("");
        setEndDate("");
    };

    const hasActiveFilters = searchTerm !== "" || statusFilter !== "all" || minPrice !== "" || maxPrice !== "" || startDate !== "" || endDate !== "";

    if (loading) {
        return (
            <div>
                <h1 className="text-4xl font-['Ivy_Ora'] mb-6">My Orders</h1>
                <div className="bg-white border p-6 rounded-xl">Loading orders...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1 className="text-4xl font-['Ivy_Ora'] mb-6">My Orders</h1>
                <div className="bg-red-50 text-red-600 border border-red-200 p-6 rounded-xl">{error}</div>
            </div>
        );
    }

    return (
        <div>
            <h1 className="text-4xl font-['Ivy_Ora'] mb-6">My Orders</h1>

            {/* Filter Bar */}
            <div className="mb-6 space-y-4">
                {/* Row 1: Search + Toggle Filters */}
                <div className="flex flex-wrap gap-3 items-center">
                    <div className="relative flex-1 min-w-50">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by product name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                        <Filter className="w-4 h-4" />
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <X className="w-4 h-4" />
                            Clear all
                        </button>
                    )}
                </div>

                {/* Row 2: Expanded Filters */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {/* Status Dropdown */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as RetailOrderStatus | "all")}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black bg-white"
                            >
                                {statusOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Min Price */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Min Price (AED)</label>
                            <input
                                type="number"
                                value={minPrice === "" ? "" : minPrice}
                                onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                                placeholder="0"
                                min="0"
                            />
                        </div>

                        {/* Max Price */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Max Price (AED)</label>
                            <input
                                type="number"
                                value={maxPrice === "" ? "" : maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                                placeholder="Any"
                                min="0"
                            />
                        </div>

                        {/* Date Range */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                            />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-black"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Orders List */}
            <div className="bg-white border rounded-xl divide-y">
                {filteredOrders.length === 0 ? (
                    <div className="p-6 text-gray-500 text-center">
                        {hasActiveFilters ? "No orders match your filters." : "No orders yet."}
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const item = order.firstItem;
                        const orderDate = new Date(order.date || order.createdAt || "");

                        return (
                            <div
                                key={order.id}
                                onClick={() => router.push(`/orders/${order.id}`)}
                                className="p-5 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition"
                            >
                                {/* LEFT */}
                                <div className="flex items-center gap-4">
                                    {item?.image && (
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-12 h-12 rounded-md object-cover border"
                                        />
                                    )}
                                    <div>
                                        <p className="font-medium">Order ID: #{order.id.slice(-8)}</p>
                                        <p className="text-sm text-gray-500">{item?.name || "No item"}</p>
                                        <p className="text-xs text-gray-400">
                                            {orderDate.toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {/* RIGHT */}
                                <div className="text-right">
                                    <span className={`text-xs px-3 py-1 rounded-full ${statusStyles[order.status]}`}>
                                        {order.status}
                                    </span>
                                    <p className="mt-2 font-semibold">
                                        {order.currency} {order.totalPrice.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Optional: show result count */}
            {filteredOrders.length > 0 && (
                <p className="text-xs text-gray-400 mt-4 text-right">
                    Showing {filteredOrders.length} of {orders.length} orders
                </p>
            )}
        </div>
    );
}