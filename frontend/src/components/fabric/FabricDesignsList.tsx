"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import { getApiErrorMessage } from "@/lib/api/client";
import { resolveMediaUrl } from "@/lib/media";
import {
    deleteFabricItem,
    fetchFabricItems,
    isShopMissingError,
    type FabricProfile,
} from "@/lib/fabricCatalog";
import { useParams } from "next/navigation";

// Reuse Toast configurations
const TOAST_BASE = {
    position: "top-right" as const,
    duration: 6000,
    style: {
        fontFamily: "var(--font-body)",
        fontSize: "13px",
        letterSpacing: "0.04em",
        borderRadius: "0",
        padding: "14px 18px",
        maxWidth: "360px",
    },
};

const SUCCESS_TOAST = {
    ...TOAST_BASE,
    style: {
        ...TOAST_BASE.style,
        background: "#f0fdf4",
        color: "#166534",
        border: "1px solid #86efac",
    },
    iconTheme: { primary: "#16a34a", secondary: "#ffffff" },
};

const ERROR_TOAST = {
    ...TOAST_BASE,
    style: {
        ...TOAST_BASE.style,
        background: "#fef2f2",
        color: "#991b1b",
        border: "1px solid #fca5a5",
    },
    iconTheme: { primary: "#dc2626", secondary: "#ffffff" },
};

export default function FabricDesignsList() {
    const t = useTranslations("FabricPortal.fabrics");
    const params = useParams();
    const locale = params.locale === "ar" ? "ar" : "en";

    const [fabrics, setFabrics] = useState<FabricProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [shopMissing, setShopMissing] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadFabrics = useCallback(async () => {
        setLoading(true);
        setShopMissing(false);

        try {
            const items = await fetchFabricItems();
            setFabrics(items);
        } catch (err: unknown) {
            if (isShopMissingError(err)) {
                setShopMissing(true);
            } else {
                toast.error(getApiErrorMessage(err, t("errors.loadFailed")), ERROR_TOAST);
            }
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadFabrics();
    }, [loadFabrics]);

    const handleDelete = async (fabric: FabricProfile) => {
        const name = locale === "ar" ? fabric.nameAr || fabric.name : fabric.name;
        if (!window.confirm(t("confirmDelete", { name }))) return;

        setDeletingId(fabric._id);
        try {
            await deleteFabricItem(fabric._id);
            setFabrics((prev) => prev.filter((item) => item._id !== fabric._id));
            toast.success(t("deleted"), SUCCESS_TOAST);
        } catch (err: unknown) {
            toast.error(getApiErrorMessage(err, t("errors.deleteFailed")), ERROR_TOAST);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="max-w-5xl border border-(--color-border) bg-white p-8">
                <p className="[font-family:var(--font-ui)] text-sm uppercase tracking-[0.2em] text-(--color-grey-muted)">
                    {t("loading")}
                </p>
            </div>
        );
    }

    if (shopMissing) {
        return (
            <div className="max-w-2xl border border-(--color-border) bg-white p-8">
                <h1 className="[font-family:var(--font-display)] text-[28px] text-black mb-3">
                    {t("shopRequiredTitle")}
                </h1>
                <p className="[font-family:var(--font-body)] text-[14px] text-(--color-grey-muted) mb-6">
                    {t("shopRequiredDescription")}
                </p>
                <Link
                    href="/fabric/shop"
                    className="inline-block px-8 py-3 bg-black text-white text-[10px] tracking-[0.22em] uppercase hover:bg-[#2A2A28] transition [font-family:var(--font-ui)]"
                >
                    {t("shopRequiredCta")}
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
                <div>
                    <p className="[font-family:var(--font-ui)] text-[10px] uppercase tracking-[0.28em] text-(--color-grey-muted) mb-3">
                        {t("eyebrow")}
                    </p>
                    <h1 className="[font-family:var(--font-display)] text-[32px] sm:text-[36px] text-black mb-2">
                        {t("title")}
                    </h1>
                    <p className="[font-family:var(--font-body)] text-[14px] text-(--color-grey-muted)">
                        {t("description")}
                    </p>
                </div>
                <Link
                    href="/fabric/fabrics/new"
                    className="inline-block text-center px-8 py-3 bg-black text-white text-[10px] tracking-[0.22em] uppercase hover:bg-[#2A2A28] transition [font-family:var(--font-ui)] shrink-0"
                >
                    {t("addFabric")}
                </Link>
            </div>

            {fabrics.length === 0 ? (
                <div className="border border-(--color-border) bg-white p-10 text-center">
                    <p className="[font-family:var(--font-body)] text-[14px] text-(--color-grey-muted) mb-6">
                        {t("empty")}
                    </p>
                    <Link
                        href="/fabric/fabrics/new"
                        className="inline-block px-8 py-3 border border-black text-black text-[10px] tracking-[0.22em] uppercase hover:bg-black hover:text-white transition [font-family:var(--font-ui)]"
                    >
                        {t("addFirst")}
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {fabrics.map((fabric) => {
                        const name = locale === "ar" ? fabric.nameAr || fabric.name : fabric.name;
                        const imageSrc = resolveMediaUrl(fabric.images?.[0]) || "/images/sub-2.png";
                        const materialDisplay = locale === "ar" ? fabric.materialAr || fabric.material : fabric.material;

                        return (
                            <div
                                key={fabric._id}
                                className="border border-(--color-border) bg-white p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6"
                            >
                                <div className="w-full sm:w-28 h-28 shrink-0 bg-[#F0EBE3] overflow-hidden">
                                    <img
                                        src={imageSrc}
                                        alt={name}
                                        loading="lazy"
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-start gap-2 mb-2">
                                        <h2 className="[font-family:var(--font-display)] text-[20px] text-black">
                                            {name}
                                        </h2>
                                        <span
                                            className={`[font-family:var(--font-ui)] text-[9px] uppercase tracking-[0.2em] px-2 py-0.5 ${
                                                fabric.isActive
                                                    ? "bg-black text-white"
                                                    : "border border-(--color-border) text-(--color-grey-muted)"
                                            }`}
                                        >
                                            {fabric.isActive ? t("statusActive") : t("statusInactive")}
                                        </span>
                                    </div>
                                    <p className="[font-family:var(--font-ui)] text-[10px] uppercase tracking-[0.18em] text-(--color-grey-muted) mb-2">
                                        {materialDisplay} · AED {fabric.pricePerMeter} / m ·{" "}
                                        {fabric.stockInMeters} m {t("inStock")}
                                    </p>
                                    <p className="[font-family:var(--font-body)] text-[13px] text-(--color-grey-muted) line-clamp-2">
                                        {locale === "ar"
                                            ? fabric.descriptionAr || fabric.description
                                            : fabric.description}
                                    </p>
                                </div>

                                <div className="flex sm:flex-col gap-3 shrink-0">
                                    <Link
                                        href={`/fabric/fabrics/${fabric._id}/edit`}
                                        className="text-center px-5 py-2.5 border border-black text-black text-[10px] tracking-[0.2em] uppercase hover:bg-black hover:text-white transition [font-family:var(--font-ui)]"
                                    >
                                        {t("edit")}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(fabric)}
                                        disabled={deletingId === fabric._id}
                                        className="px-5 py-2.5 border border-red-300 text-red-700 text-[10px] tracking-[0.2em] uppercase hover:bg-red-50 transition disabled:opacity-50 [font-family:var(--font-ui)]"
                                    >
                                        {deletingId === fabric._id ? t("deleting") : t("delete")}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
