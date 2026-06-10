"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api/client";
import { Link } from "@/i18n/navigation";
import {
    Plus,
    Edit,
    Package,
    AlertCircle,
    Search,
    RefreshCw,
} from "lucide-react";

interface ReadyMadeItem {
    _id: string;
    name: string;
    size: string;
    returnReason: string;
    customOrderId?: {
        _id: string;
        orderNumber?: string;
    };
    status: "available" | "sold";
    createdAt: string;
    updatedAt: string;
}

export default function AdminReadyMadePage() {
    const { user } = useAuth();
    const [items, setItems] = useState<ReadyMadeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setLoading(true);
            const data = await api.get<ReadyMadeItem[]>('/api/admin/ready-made');
            setItems(data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch ready-made items:', err);
            setError(err.message || 'Failed to load ready-made items');
        } finally {
            setLoading(false);
        }
    };

    // Safe filter with optional chaining and default values
    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const term = searchTerm.toLowerCase();
        return items.filter(item => {
            const name = item.name?.toLowerCase() || '';
            const size = item.size?.toLowerCase() || '';
            const reason = item.returnReason?.toLowerCase() || '';
            const orderNumber = item.customOrderId?.orderNumber?.toLowerCase() || '';
            const status = item.status?.toLowerCase() || '';
            return name.includes(term) || size.includes(term) || reason.includes(term) || orderNumber.includes(term) || status.includes(term);
        });
    }, [items, searchTerm]);

    // Normalize status to lowercase for comparison
    const normalizeStatus = (status: string) => status?.toLowerCase().trim();
    const availableItems = items.filter(i => normalizeStatus(i.status) === 'available').length;
    const soldItems = items.filter(i => normalizeStatus(i.status) === 'sold').length;

    const StatusBadge = ({ status }: { status: string }) => {
        const normalized = status?.toLowerCase().trim();
        const isAvailable = normalized === 'available';
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAvailable
                    ? 'bg-white text-black border border-black/30'
                    : 'bg-gray-100 text-gray-500 border border-gray-200'
                }`}>
                {isAvailable ? 'Available' : 'Sold'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-8 w-48 bg-gray-200 rounded"></div>
                        <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-7 w-16 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="p-4 border-b border-gray-100">
                                <div className="grid grid-cols-5 gap-4">
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                    <div className="h-4 bg-gray-200 rounded"></div>
                                </div>
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
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="font-normal text-xl text-black">Unable to load ready-made items</p>
                    <p className="text-gray-500 mt-2 text-sm">{error}</p>
                    <button
                        onClick={fetchItems}
                        className="mt-6 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition text-sm"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-light text-black tracking-tight">Ready-made Inventory</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage size‑return pieces and their availability</p>
                </div>
                <Link
                    href="/admin/ready-made/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Create new
                </Link>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Total items</p>
                    <p className="text-2xl font-light text-black mt-1">{items.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Available</p>
                    <p className="text-2xl font-light text-black mt-1">{availableItems}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Sold</p>
                    <p className="text-2xl font-light text-black mt-1">{soldItems}</p>
                </div>
            </div>

            {/* Search & refresh */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, size, reason, order..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition"
                    />
                </div>
                <button
                    onClick={fetchItems}
                    className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-black transition text-sm border border-gray-200 rounded-lg bg-white"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Table */}
            {filteredItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">
                        {searchTerm ? "No items match your search." : "No ready-made items yet."}
                    </p>
                    {!searchTerm && (
                        <Link
                            href="/admin/ready-made/new"
                            className="inline-block mt-4 text-black underline underline-offset-4 hover:text-gray-600"
                        >
                            Create your first item
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Reason</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredItems.map((item) => (
                                    <tr key={item._id} className="group hover:bg-gray-50 transition-all duration-200">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">{item.name || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.size || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.returnReason || '—'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                                            {item.customOrderId
                                                ? `#${item.customOrderId.orderNumber || item.customOrderId._id.slice(-6)}`
                                                : <span className="text-gray-300">—</span>
                                            }
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Link
                                                href={`/admin/ready-made/${item._id}/edit`}
                                                className="inline-flex items-center gap-1 text-gray-400 group-hover:text-black transition-colors"
                                            >
                                                <Edit className="w-4 h-4" />
                                                <span className="text-sm">Edit</span>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}