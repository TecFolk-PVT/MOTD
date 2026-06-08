"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { api, type ApiError } from "@/lib/api/client";
import type { FabricDetailItem } from "@/lib/fabrics";
import MainLayout from "../../main/layout";
import FadeInSection from "@/components/shared/fadeInSection";
import FabricDetailView from "@/components/fabric/FabricDetailView";
import { Link } from "@/i18n/navigation";

export default function FabricDetailPage() {
    const params = useParams();
    const router = useRouter();
    const t = useTranslations("FabricDetail");
    const slug = params.slug as string;
    const locale = params.locale === "ar" ? "ar" : "en";

    const [fabric, setFabric] = useState<FabricDetailItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchFabric = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await api.get<{ success: boolean; item: FabricDetailItem }>(
                    `/api/fabrics/${slug}`,
                );

                if (!data?.success || !data.item) {
                    throw new Error("Fabric not found");
                }

                setFabric(data.item);
            } catch (err: unknown) {
                const message =
                    (err as ApiError)?.message ||
                    (err instanceof Error ? err.message : "Failed to load fabric");
                setError(message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchFabric();
    }, [slug]);

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-[50vh] flex items-center justify-center">
                    <p className="[font-family:var(--font-ui)] text-sm uppercase tracking-[0.2em]">
                        {t("loading")}
                    </p>
                </div>
            </MainLayout>
        );
    }

    if (error || !fabric) {
        return (
            <MainLayout>
                <div className="min-h-[50vh] flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <h1 className="[font-family:var(--font-display)] text-2xl text-black mb-3">
                            {t("notFoundTitle")}
                        </h1>
                        <p className="text-sm text-(--color-grey-muted) mb-6">
                            {error || t("notFound")}
                        </p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <Link
                                href="/fabrics/fabricStore"
                                className="px-6 py-3 bg-black text-white text-[10px] tracking-[0.22em] uppercase hover:bg-[#1A1A1A] transition"
                            >
                                {t("browseAll")}
                            </Link>
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-6 py-3 border border-black text-[10px] tracking-[0.22em] uppercase hover:bg-black hover:text-white transition"
                            >
                                {t("goBack")}
                            </button>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <FadeInSection>
                <FabricDetailView
                    fabric={fabric}
                    locale={locale}
                    labels={{
                        fabrics: t("fabrics"),
                        material: t("material"),
                        color: t("color"),
                        city: t("city"),
                        perMeter: t("perMeter"),
                        selectForCustomOrder: t("selectForCustomOrder"),
                        storeTitle: t("storeTitle"),
                        pickupLabel: t("pickupLabel"),
                        partnerNote: t("partnerNote"),
                    }}
                />
            </FadeInSection>
        </MainLayout>
    );
}
