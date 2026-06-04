"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import MainLayout from "../../main/layout";
import FadeInSection from "@/components/shared/fadeInSection";

export default function ReadyMadeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [product, setProduct] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ---------------------------
    // FETCH SINGLE PRODUCT
    // ---------------------------
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await api.get<any>(`/api/ready-made/${slug}`);
                if (!data?.success || !data.item) {
                    throw new Error("Product not found");
                }
                setProduct(data.item);
            } catch (err: any) {
                setError(err?.message || "Failed to load product");
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchProduct();
    }, [slug]);

    // ---------------------------
    // LOADING STATE
    // ---------------------------
    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-(--bg-page) flex items-center justify-center px-4">
                    <div className="text-center">
                        <div className="w-12 h-12 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-4" />
                        <p className="[font-family:var(--font-ui)] text-[10px] xs:text-[11px] tracking-[0.24em] uppercase text-(--color-grey-muted)">
                            Loading product...
                        </p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    // ---------------------------
    // ERROR / NOT FOUND UI
    // ---------------------------
    if (error || !product) {
        return (
            <MainLayout>
                <div className="min-h-screen bg-(--bg-page) flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <div className="w-20 h-20 mx-auto mb-6 bg-[#F2F2F0] rounded-full flex items-center justify-center">
                            <svg className="w-10 h-10 text-[#5A5A56]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4M12 4v16" />
                            </svg>
                        </div>
                        <h1 className="[font-family:var(--font-display)] text-[28px] xs:text-[32px] sm:text-[36px] text-black mb-3">
                            Product Not Found
                        </h1>
                        <p className="text-[13px] xs:text-[14px] text-[#5A5A56] mb-6">
                            The ready‑made item you're looking for doesn't exist or may have been removed.
                        </p>
                        <div className="flex gap-3 justify-center flex-wrap">
                            <button
                                onClick={() => router.push('/ready-made')}
                                className="px-6 py-3 bg-black text-white text-[10px] xs:text-[11px] tracking-[0.22em] uppercase hover:bg-[#1A1A1A] transition duration-300"
                            >
                                Browse All Ready‑Made
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="px-6 py-3 border border-black text-[10px] xs:text-[11px] tracking-[0.22em] uppercase hover:bg-black hover:text-white transition duration-300"
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const title = product.name;
    const desc = product.description;
    const image = product.images?.[0] || "/placeholder.png";

    return (
        <MainLayout>
            <FadeInSection>
                <div className="bg-(--bg-page) py-12 xs:py-16 sm:py-20 md:py-24">
                    <div className="px-4 xs:px-6 sm:px-8 md:px-12 lg:px-(--space-40) w-full mx-auto max-w-7xl">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xs:gap-10 md:gap-12 lg:gap-(--space-40)">
                            {/* IMAGE SECTION */}
                            <div className="aspect-4/5 relative overflow-hidden bg-[#F5F5F0] rounded-lg group">
                                <img
                                    src={image}
                                    alt={title}
                                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                            </div>

                            {/* DETAILS SECTION */}
                            <div className="flex flex-col">
                                {/* TITLE - responsive with clamp */}
                                <h1 className="[font-family:var(--font-display)] text-[28px] xs:text-[32px] sm:text-[36px] md:text-[40px] lg:text-[44px] xl:text-[48px] font-normal leading-[1.1] tracking-[-0.01em] text-black mb-4">
                                    {title}
                                </h1>

                                {/* PRICE */}
                                <p className="[font-family:var(--font-ui)] text-[16px] xs:text-[18px] sm:text-[20px] md:text-[22px] tracking-[0.24em] text-black mb-4">
                                    AED {product.price}
                                </p>

                                {/* SIZE */}
                                <div className="mb-4">
                                    <span className="[font-family:var(--font-ui)] text-[9px] xs:text-[10px] uppercase tracking-[0.24em] text-(--color-grey-muted) block mb-1">
                                        Size
                                    </span>
                                    <p className="[font-family:var(--font-body)] text-[14px] xs:text-[15px] sm:text-[16px] text-black">
                                        {product.size}
                                    </p>
                                </div>

                                {/* CONDITION */}
                                {product.condition && (
                                    <div className="mb-4">
                                        <span className="[font-family:var(--font-ui)] text-[9px] xs:text-[10px] uppercase tracking-[0.24em] text-(--color-grey-muted) block mb-1">
                                            Condition
                                        </span>
                                        <p className="[font-family:var(--font-body)] text-[14px] xs:text-[15px] sm:text-[16px] text-black">
                                            {product.condition}
                                        </p>
                                    </div>
                                )}

                                {/* STOCK */}
                                <div className="mb-6">
                                    <span className="[font-family:var(--font-ui)] text-[9px] xs:text-[10px] uppercase tracking-[0.24em] text-(--color-grey-muted) block mb-1">
                                        Availability
                                    </span>
                                    <p className={`[font-family:var(--font-body)] text-[14px] xs:text-[15px] sm:text-[16px] ${product.countInStock > 0 ? "text-green-700" : "text-red-600"}`}>
                                        {product.countInStock > 0 ? `In stock (${product.countInStock})` : "Out of stock"}
                                    </p>
                                </div>

                                {/* DESCRIPTION */}
                                <div className="mb-8">
                                    <span className="[font-family:var(--font-ui)] text-[9px] xs:text-[10px] uppercase tracking-[0.24em] text-(--color-grey-muted) block mb-2">
                                        Description
                                    </span>
                                    <p className="[font-family:var(--font-body)] text-[14px] xs:text-[15px] sm:text-[16px] leading-relaxed text-(--color-grey-muted)">
                                        {desc}
                                    </p>
                                </div>

                                {/* READY MADE INFO BANNER */}
                                <div className="p-3 xs:p-4 border border-(--color-border) bg-(--bg-page) mb-6 rounded">
                                    <p className="[font-family:var(--font-ui)] text-[9px] xs:text-[10px] uppercase tracking-[0.24em] text-(--color-grey-muted) text-center">
                                        ⚠ This is a size‑return ready‑made item from a custom order.
                                    </p>
                                </div>

                                {/* ADD TO CART BUTTON */}
                                <button
                                    disabled={product.countInStock < 1}
                                    className={`
                                        w-full py-3 px-6 border border-black text-[10px] xs:text-[11px] tracking-[0.24em] uppercase
                                        [font-family:var(--font-ui)] transition-all duration-300
                                        ${product.countInStock < 1
                                            ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-500 border-gray-300"
                                            : "bg-black text-white hover:bg-white hover:text-black hover:border-black"
                                        }
                                    `}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </FadeInSection>
        </MainLayout>
    );
}