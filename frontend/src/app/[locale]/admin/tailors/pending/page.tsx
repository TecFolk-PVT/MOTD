"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Users,
  AlertCircle,
} from "lucide-react";

interface Tailor {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  phone?: string;
  address?: string;
  approvalStatus: "pending" | "approved" | "rejected";
}

export default function PendingTailorsPage() {
  const params = useParams();
  const localeParams = params.locale as string;

  const [tailors, setTailors] = useState<Tailor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPendingTailors = async () => {
    setLoading(true);
    setError(null);
    try {
      // Backend returns a plain array directly (not wrapped in { users: [] })
      const response = await api.get<any>("/api/admin/tailors/pending");
      const raw: any[] = Array.isArray(response) ? response : [];

      const mapped: Tailor[] = raw.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        phone: user.phone || "",
        address: user.address || "",
        approvalStatus: user.approvalStatus,
      }));

      setTailors(mapped);
    } catch (err: any) {
      const message = getApiErrorMessage(err, "Failed to load pending tailors");
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingTailors();
  }, []);

  const filteredTailors = useMemo(() => {
    if (!searchTerm.trim()) return tailors;
    const term = searchTerm.toLowerCase();
    return tailors.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term),
    );
  }, [tailors, searchTerm]);

  const handleApprove = async (tailorId: string, tailorName: string) => {
    if (!confirm(`Approve ${tailorName}?`)) return;
    setActionInProgress(tailorId);
    try {
      await api.patch(`/api/admin/tailors/${tailorId}/approve`);
      toast.success("Tailor approved successfully");
      // Update status in-place so the admin sees the result
      setTailors((prev) =>
        prev.map((t) =>
          t.id === tailorId ? { ...t, approvalStatus: "approved" } : t,
        ),
      );
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Approval failed"));
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (tailorId: string, tailorName: string) => {
    const note = window.prompt("Optional rejection reason:", "");
    if (note === null) return; // cancelled
    if (!confirm(`Reject ${tailorName}?`)) return;

    setActionInProgress(tailorId);
    try {
      await api.patch(`/api/admin/tailors/${tailorId}/reject`, {
        rejectionNote: note,
        note,
      });
      toast.success("Tailor rejected");
      // Update status in-place so the admin sees the result
      setTailors((prev) =>
        prev.map((t) =>
          t.id === tailorId ? { ...t, approvalStatus: "rejected" } : t,
        ),
      );
    } catch (err: any) {
      toast.error(getApiErrorMessage(err, "Rejection failed"));
    } finally {
      setActionInProgress(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(
      localeParams === "ar" ? "ar-EG" : "en-US",
      { year: "numeric", month: "short", day: "numeric" },
    );

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 w-56 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-80 bg-gray-100 rounded mb-8" />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 border-b border-gray-100 last:border-0">
                <div className="grid grid-cols-5 gap-4">
                  {[...Array(5)].map((_, j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="font-normal text-xl text-black">Failed to load tailors</p>
          <p className="text-gray-500 mt-2 text-sm">{error}</p>
          <button
            onClick={fetchPendingTailors}
            className="mt-6 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ─── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-black tracking-tight">
            Pending Approvals
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {tailors.length} tailor{tailors.length !== 1 ? "s" : ""} waiting for review
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          Approve or reject each application
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black transition"
          />
        </div>
        <button
          onClick={fetchPendingTailors}
          className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-black transition text-sm border border-gray-200 rounded-lg bg-white"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Empty state */}
      {filteredTailors.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">
            {searchTerm
              ? "No tailors match your search."
              : "No pending tailors at the moment."}
          </p>
        </div>
      ) : (
        /* Table */
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
                    Signup Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTailors.map((tailor) => {
                  const busy = actionInProgress === tailor.id;
                  return (
                    <tr
                      key={tailor.id}
                      className="group hover:bg-gray-50 transition-all duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                        {tailor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tailor.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(tailor.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {tailor.phone || tailor.address ? (
                          <div>
                            {tailor.phone && <div>{tailor.phone}</div>}
                            {tailor.address && (
                              <div className="text-xs text-gray-400">{tailor.address}</div>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tailor.approvalStatus === "approved" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {tailor.approvalStatus === "rejected" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                        {tailor.approvalStatus === "pending" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tailor.approvalStatus === "pending" ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApprove(tailor.id, tailor.name)}
                              disabled={busy}
                              title="Approve"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(tailor.id, tailor.name)}
                              disabled={busy}
                              title="Reject"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Decision made</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
