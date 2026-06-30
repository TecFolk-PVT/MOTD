"use client";

import { useTranslations } from "next-intl";
import { ShoppingBag } from "lucide-react";

export default function FabricOrdersPage() {
    const t = useTranslations("FabricPortal");

    return (
        <div className="max-w-5xl">
            <div className="mb-8">
                <p className="[font-family:var(--font-ui)] text-[10px] uppercase tracking-[0.28em] text-(--color-grey-muted) mb-3">
                    {t("nav.orders")}
                </p>
                <h1 className="[font-family:var(--font-display)] text-[32px] sm:text-[36px] text-black mb-2">
                    {t("nav.orders")}
                </h1>
                <p className="[font-family:var(--font-body)] text-[14px] text-(--color-grey-muted)">
                    Track and fulfill customer fabric purchase orders here.
                </p>
            </div>

            <div className="border border-(--color-border) bg-white p-12 text-center rounded-2xl">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-neutral-300" />
                <p className="[font-family:var(--font-body)] text-[14px] text-(--color-grey-muted)">
                    No customer orders found.
                </p>
            </div>
        </div>
    );
}
