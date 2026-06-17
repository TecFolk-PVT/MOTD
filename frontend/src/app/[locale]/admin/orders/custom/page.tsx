"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";
import { RefreshCw, Loader2 } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

interface Order {
  _id: string;
  orderNumber?: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  tailorShopId: {
    _id: string;
    name: string;
  };
  designSnapshot: {
    name: string;
    fabric?: { name: string };
  };
  fabricSnapshot: {
    name: string;
  };
  status: string;
  createdAt: string;
  pricing: {
    total: number;
    currency: string;
  };
}

export default function AdminCustomOrdersPage() {
  const params = useParams();
  const locale = params.locale as string;

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const [selectedStatus, setSelectedStatus] = useState<Record<string, string>>(
    {},
  );
  const [note, setNote] = useState<Record<string, string>>({});

  const allStatuses = [
    "pending",
    "confirmed",
    "scheduled",
    "at_tailor",
    "in_production",
    "ready",
    "out_for_delivery",
    "delivered",
  ];

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/api/admin/orders/custom");
      const ordersData = Array.isArray(res) ? res : res.items || [];

      setOrders(ordersData);

      const initialStatus: Record<string, string> = {};
      const initialNote: Record<string, string> = {};

      ordersData.forEach((order: Order) => {
        initialStatus[order._id] = order.status;
        initialNote[order._id] = "";
      });

      setSelectedStatus(initialStatus);
      setNote(initialNote);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load custom orders"));
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string) => {
    const newStatus = selectedStatus[orderId];
    const noteText = note[orderId] || "";

    if (!newStatus) return toast.error("Select a status");

    setUpdatingOrderId(orderId);
    try {
      await api.patch(`/api/admin/orders/custom/${orderId}/status`, {
        status: newStatus,
        note: noteText,
      });

      toast.success("Order updated");
      await fetchOrders();
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Failed to update status"));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatCurrency = (amount: number, currency = "AED") =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);

  if (loading) {
    return <div className="p-6 text-gray-500">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-light">Custom Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage tailoring workflow
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: orders.length },
          {
            label: "Pending",
            value: orders.filter((o) => o.status === "pending").length,
          },
          {
            label: "In Production",
            value: orders.filter((o) => o.status === "in_production").length,
          },
          {
            label: "Delivered",
            value: orders.filter((o) => o.status === "delivered").length,
          },
        ].map((s) => (
          <div key={s.label} className="bg-white border rounded-2xl p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-xl font-light">{s.value}</p>
          </div>
        ))}
      </div>

      {/* EMPTY */}
      {orders.length === 0 ? (
        <div className="p-10 text-center border rounded-2xl text-gray-500">
          No orders found
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isUpdating = updatingOrderId === order._id;
            const currentStatus = selectedStatus[order._id] || order.status;

            return (
              <div
                key={order._id}
                className="border rounded-2xl bg-white overflow-hidden"
              >
                {/* ================= ROW 1 ================= */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
                  {/* Customer */}
                  <div>
                    <p className="text-xs text-gray-400">Customer</p>
                    <p className="font-medium">{order.userId.name}</p>
                    <p className="text-xs text-gray-500">
                      {order.userId.email}
                    </p>
                  </div>

                  {/* Design */}
                  <div>
                    <p className="text-xs text-gray-400">Design</p>
                    <p className="text-sm">{order.designSnapshot.name}</p>
                    <p className="text-xs text-gray-500">
                      Fabric: {order.fabricSnapshot.name}
                    </p>
                  </div>

                  {/* Tailor */}
                  <div>
                    <p className="text-xs text-gray-400">Tailor</p>
                    <p className="text-sm">{order.tailorShopId.name}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs text-gray-400">Status</p>
                    <StatusBadge status={order.status} />
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs text-gray-400">Date</p>
                    <p className="text-sm">{formatDate(order.createdAt)}</p>
                  </div>
                </div>

                {/* ================= ROW 2 ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-t bg-gray-50">
                  {/* Total */}
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="font-medium">
                      {formatCurrency(
                        order.pricing.total,
                        order.pricing.currency,
                      )}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
                    <select
                      value={currentStatus}
                      onChange={(e) =>
                        setSelectedStatus((prev) => ({
                          ...prev,
                          [order._id]: e.target.value,
                        }))
                      }
                      className="border rounded-lg px-2 py-1 text-sm"
                      disabled={isUpdating}
                    >
                      {allStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Note"
                      value={note[order._id] || ""}
                      onChange={(e) =>
                        setNote((prev) => ({
                          ...prev,
                          [order._id]: e.target.value,
                        }))
                      }
                      className="border rounded-lg px-2 py-1 text-sm"
                      disabled={isUpdating}
                    />

                    <button
                      onClick={() => handleUpdateStatus(order._id)}
                      disabled={isUpdating}
                      className="bg-black text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 text-center"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Update"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
