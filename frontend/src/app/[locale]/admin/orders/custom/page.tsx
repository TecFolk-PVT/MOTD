"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { api, getApiErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";
import { RefreshCw, Loader2 } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import AdminOrdersTabs from "@/components/admin/AdminOrdersTabs";
import {
  formatOrderDate,
  getNextCustomOrderStatus,
  getPreviousCustomOrderStatus,
  isCustomOrderStatus,
  type CustomOrderStatus,
} from "@/lib/customOrders";
import type { Locale } from "@/i18n/routing";

interface OrderUser {
  _id: string;
  name: string;
  email: string;
}

interface Order {
  _id: string;
  userId: OrderUser | string;
  tailorShopId: { _id: string; name: string } | string;
  designSnapshot?: { name: string };
  fabricSnapshot?: { name: string } | null;
  status: string;
  createdAt: string;
  pricing: {
    total: number;
    currency: string;
  };
}

function readPartnerName(
  value: { name?: string } | string | null | undefined,
  fallback: string,
): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name || fallback;
}

export default function AdminCustomOrdersPage() {
  const params = useParams();
  const locale = (params.locale as Locale) || "en";
  const t = useTranslations("Admin.OrdersCustom");
  const tStatus = useTranslations("OrdersPage.custom.statuses");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [note, setNote] = useState<Record<string, string>>({});

  const statusLabel = (status: string) => {
    if (isCustomOrderStatus(status)) {
      return tStatus(status);
    }
    return status.replace(/_/g, " ");
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Order[] | { items: Order[] }>("/api/admin/orders/custom");
      const ordersData = Array.isArray(res) ? res : res.items || [];
      setOrders(ordersData);

      const initialNote: Record<string, string> = {};
      ordersData.forEach((order) => {
        initialNote[order._id] = "";
      });
      setNote(initialNote);
    } catch (err) {
      setError(getApiErrorMessage(err, t("loadError")));
      toast.error(t("loadToastError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (order: Order, newStatus: CustomOrderStatus) => {
    setUpdatingOrderId(order._id);
    try {
      await api.patch(`/api/admin/orders/custom/${order._id}/status`, {
        status: newStatus,
        note: note[order._id] || "",
      });

      toast.success(t("updateSuccess"));
      await fetchOrders();
    } catch (err) {
      toast.error(getApiErrorMessage(err, t("updateFailed")));
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const formatCurrency = (amount: number, currency = "AED") =>
    new Intl.NumberFormat(locale === "ar" ? "ar-AE" : "en-AE", {
      style: "currency",
      currency,
    }).format(amount);

  if (loading) {
    return <div className="p-6 text-gray-500">{t("loading")}</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <AdminOrdersTabs />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-light">{t("title")}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("subtitle")}</p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" />
          {t("refresh")}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: t("stats.total"), value: orders.length },
          {
            label: t("stats.pending"),
            value: orders.filter((o) => o.status === "pending").length,
          },
          {
            label: t("stats.inProduction"),
            value: orders.filter((o) => o.status === "in_production").length,
          },
          {
            label: t("stats.delivered"),
            value: orders.filter((o) => o.status === "delivered").length,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border rounded-2xl p-4">
            <p className="text-xs text-gray-400">{stat.label}</p>
            <p className="text-xl font-light">{stat.value}</p>
          </div>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="p-10 text-center border rounded-2xl text-gray-500">
          {t("empty")}
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isUpdating = updatingOrderId === order._id;
            const nextStatus = getNextCustomOrderStatus(order.status);
            const previousStatus = getPreviousCustomOrderStatus(order.status);
            const customerName = readPartnerName(
              typeof order.userId === "object" ? order.userId : null,
              t("unknownCustomer"),
            );
            const customerEmail =
              typeof order.userId === "object" ? order.userId.email : "";
            const tailorName = readPartnerName(
              typeof order.tailorShopId === "object" ? order.tailorShopId : null,
              t("unknownTailor"),
            );
            const fabricName = order.fabricSnapshot?.name || t("unknownFabric");

            return (
              <div
                key={order._id}
                className="border rounded-2xl bg-white overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4">
                  <div>
                    <p className="text-xs text-gray-400">{t("columns.customer")}</p>
                    <p className="font-medium">{customerName}</p>
                    {customerEmail && (
                      <p className="text-xs text-gray-500">{customerEmail}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">{t("columns.design")}</p>
                    <p className="text-sm">
                      {order.designSnapshot?.name || t("unknownDesign")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("fabricLabel", { name: fabricName })}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">{t("columns.tailor")}</p>
                    <p className="text-sm">{tailorName}</p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">{t("columns.status")}</p>
                    <StatusBadge
                      status={order.status}
                      label={statusLabel(order.status)}
                    />
                  </div>

                  <div>
                    <p className="text-xs text-gray-400">{t("columns.date")}</p>
                    <p className="text-sm">{formatOrderDate(order.createdAt, locale)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border-t bg-gray-50">
                  <div>
                    <p className="text-xs text-gray-400">{t("columns.total")}</p>
                    <p className="font-medium">
                      {formatCurrency(order.pricing.total, order.pricing.currency)}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 sm:justify-end sm:items-center flex-wrap">
                    <input
                      type="text"
                      placeholder={t("notePlaceholder")}
                      value={note[order._id] || ""}
                      onChange={(e) =>
                        setNote((prev) => ({
                          ...prev,
                          [order._id]: e.target.value,
                        }))
                      }
                      className="border rounded-lg px-2 py-1 text-sm flex-1 min-w-[140px]"
                      disabled={isUpdating}
                    />

                    {previousStatus && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(order, previousStatus)}
                        disabled={isUpdating}
                        className="border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1 min-w-[140px] hover:bg-gray-100 disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          t("revertTo", { status: statusLabel(previousStatus) })
                        )}
                      </button>
                    )}

                    {nextStatus ? (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(order, nextStatus)}
                        disabled={isUpdating}
                        className="bg-black text-white px-3 py-2 rounded-lg text-xs flex items-center justify-center gap-1 min-w-[140px] disabled:opacity-50"
                      >
                        {isUpdating ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          t("advanceTo", { status: statusLabel(nextStatus) })
                        )}
                      </button>
                    ) : null}
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
