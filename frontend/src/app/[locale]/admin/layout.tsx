"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Link } from "@/i18n/navigation";
import {
    LayoutDashboard,
    Shirt,
    Scissors,
    Users,
    ShoppingBag,
    Store,
    Settings,
    LogOut,
} from "lucide-react";
import white_logo from "../../../../public/PNG/White/MOTD_Wordmark_White.png";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Extract locale from pathname (e.g., "/en/admin" -> "en")
    const locale = pathname.split('/')[1] || "en";

    // ===================== GUARD (C-11) =====================
    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push(`/${locale}/auth/login`);
                return;
            }

            if (user.role !== "admin") {
                router.push("/");
            }
        }
    }, [user, isLoading, router, locale]);

    // ===================== LOADING STATE =====================
    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-black text-white">
                Loading admin panel...
            </div>
        );
    }

    // ===================== REDIRECT FOR NON-ADMIN =====================
    if (!user || user.role !== "admin") {
        return null; // useEffect will handle redirect
    }

    const navItems = [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Ready-made", href: "/admin/ready-made", icon: Shirt },
        { label: "Fabrics", href: "/admin/fabrics", icon: Scissors },
        { label: "Tailors", href: "/admin/tailors", icon: Users },
        { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
        { label: "Partners", href: "/admin/partners", icon: Store },
        { label: "Settings", href: "/admin/settings", icon: Settings },
    ];

    // Helper to check active link (exact or subpath)
    const isActiveLink = (href: string) => {
        if (href === "/admin") {
            return pathname === "/admin";
        }
        return pathname.startsWith(href);
    };

    // ===================== UI =====================
    return (
        <div className="h-screen flex bg-black text-white overflow-hidden">

            {/* ================= SIDEBAR ================= */}
            <aside className="w-72 h-full border-r border-white/10 flex flex-col p-6">

                {/* BRAND */}
                <div className="mb-10">
                    <Link href="/admin">
                        <img
                            src={white_logo.src}
                            alt="MOTD Admin Logo"
                            className="h-3 xs:h-[13px] sm:h-3.5 md:h-4 lg:h-4.5 xl:h-5 2xl:h-5.5 3xl:h-[24px] w-auto object-contain"
                        />
                        <span className="sr-only">MOTD Admin</span>
                    </Link>
                    <p className="text-white/50 text-xs mt-3">
                        Control Panel
                    </p>
                </div>

                {/* NAV */}
                <nav className="flex-1 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isActiveLink(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition
                                ${isActive
                                        ? "bg-white text-black"
                                        : "text-white/70 hover:bg-white/10"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* LOGOUT */}
                <button
                    onClick={() => {
                        logout();
                        router.push(`/${locale}/auth/login`);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition hover:cursor-pointer"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </aside>

            {/* ================= CONTENT AREA ================= */}
            <main className="flex-1 h-full overflow-y-auto bg-gray-100 text-black p-10">
                {children}
            </main>
        </div>
    );
}