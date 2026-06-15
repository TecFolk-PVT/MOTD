"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api/client";
import { Link } from "@/i18n/navigation";
import {
    Plus,
    Edit,
    Trash2,
    Users,
    AlertCircle,
    Search,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
} from "lucide-react";

interface Tailor {
    _id: string;
    name: string;
    email: string;
    role: string;
    approvalStatus: "pending" | "approved" | "rejected";
    phone?: string;
    city?: string;
    createdAt: string;
    updatedAt: string;
}

export default function AdminTailorsPage() {
    const params = useParams();
    const localeParam = params.locale as string;
    // Using locale only for navigation links (e.g., /admin/tailors/new)
    // All labels are English only

    const [tailors, setTailors] = useState<Tailor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchTailors();
    }, []);

    const fetchTailors = async () => {
        try {
            setLoading(true);

            // 1️⃣ Approved tailors — shop-centric, returns { items: TailorShop[] }
            const approvedData = await api.get<any>("/api/admin/tailors");
            const approvedTailors: Tailor[] = (approvedData.items || []).map((shop: any) => ({
                _id: shop._id,
                name: shop.ownerId?.name || shop.name,
                email: shop.ownerId?.email || "—",
                role: "tailor",
                approvalStatus: "approved" as const,
                phone: shop.phone || "",
                city: shop.city || "",
                createdAt: shop.createdAt,
                updatedAt: shop.updatedAt,
            }));

            // 2️⃣ Pending tailors — returns a plain User[] array (not wrapped)
            const pendingRaw = await api.get<any>("/api/admin/tailors/pending");
            const pendingArray: any[] = Array.isArray(pendingRaw) ? pendingRaw : [];
            const pendingTailors: Tailor[] = pendingArray.map((user: any) => ({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                approvalStatus: "pending" as const,
                phone: "",   // User model has no phone field
                city: "",    // User model has no city field
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            }));

            setTailors([...approvedTailors, ...pendingTailors]);
            setError(null);
        } catch (err: unknown) {
            setError(getApiErrorMessage(err, "Failed to load tailors"));
        } finally {
            setLoading(false);
        }
    };

    const filteredTailors = useMemo(() => {
        if (!searchTerm) return tailors;
        const term = searchTerm.toLowerCase();
        return tailors.filter((tailor) => {
            const name = tailor.name?.toLowerCase() || "";
            const email = tailor.email?.toLowerCase() || "";
            const phone = tailor.phone?.toLowerCase() || "";
            const city = tailor.city?.toLowerCase() || "";
            return (
                name.includes(term) ||
                email.includes(term) ||
                phone.includes(term) ||
                city.includes(term)
            );
        });
    }, [tailors, searchTerm]);

    const stats = {
        total: tailors.length,
        approved: tailors.filter((t) => t.approvalStatus === "approved").length,
        pending: tailors.filter((t) => t.approvalStatus === "pending").length,
        rejected: tailors.filter((t) => t.approvalStatus === "rejected").length,
    };

    const StatusBadge = ({ status }: { status: Tailor["approvalStatus"] }) => {
        const config = {
            approved: { icon: CheckCircle, text: "Approved", classes: "bg-green-50 text-green-700 border-green-200" },
            pending: { icon: Clock, text: "Pending", classes: "bg-yellow-50 text-yellow-700 border-yellow-200" },
            rejected: { icon: XCircle, text: "Rejected", classes: "bg-red-50 text-red-700 border-red-200" },
        };
        const { icon: Icon, text, classes } = config[status];
        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${classes}`}>
                <Icon className="w-3 h-3" />
                {text}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="flex justify-between items-center mb-6">
                        <div className="h-8 w-48 bg-gray-200 rounded"></div>
                        <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                                <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                                <div className="h-7 w-16 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="p-4 border-b border-gray-100">
                                <div className="grid grid-cols-6 gap-4">
                                    {[...Array(6)].map((_, j) => (
                                        <div key={j} className="h-4 bg-gray-200 rounded"></div>
                                    ))}
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
                    <p className="font-normal text-xl text-black">Failed to load tailors</p>
                    <p className="text-gray-500 mt-2 text-sm">{error}</p>
                    <button
                        onClick={fetchTailors}
                        className="mt-6 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition text-sm"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-light text-black tracking-tight">
                        Tailors
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Manage all registered tailors</p>
                </div>
                <Link
                    href={`/${localeParam}/admin/tailors/new`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition text-sm shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Add Tailor
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
                    <p className="text-2xl font-light text-black mt-1">{stats.total}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Approved</p>
                    <p className="text-2xl font-light text-black mt-1">{stats.approved}</p>
                </div>
                <Link
                    href={`/admin/tailors/pending`}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                >
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Pending</p>
                    <p className="text-2xl font-light text-black mt-1">{stats.pending}</p>
                </Link>
                <Link href={`/${localeParam}/admin/tailors/rejected`} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Rejected</p>
                    <p className="text-2xl font-light text-black mt-1">{stats.rejected}</p>
                </Link>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, phone or city..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition"
                    />
                </div>
                <button
                    onClick={fetchTailors}
                    className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-black transition text-sm border border-gray-200 rounded-lg bg-white"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {filteredTailors.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">
                        {searchTerm ? "No tailors match your search." : "No tailors found."}
                    </p>
                    {!searchTerm && (
                        <Link
                            href={`/${localeParam}/admin/tailors/new`}
                            className="inline-block mt-4 text-black underline underline-offset-4 hover:text-gray-600"
                        >
                            Create your first tailor
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Phone
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        City
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Joined
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTailors.map((tailor) => (
                                    <tr
                                        key={tailor._id}
                                        className="group hover:bg-gray-50 transition-all duration-200"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                                            {tailor.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {tailor.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {tailor.phone || "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {tailor.city || "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(tailor.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={tailor.approvalStatus} />
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