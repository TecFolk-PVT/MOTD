// app/[locale]/auth/login/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "../../../../components/auth/loginForm"; // adjust import path

export default function LoginPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    // Redirect authenticated users based on role
    useEffect(() => {
        if (!isLoading && user) {
            const role = user.role.toLowerCase();
            if (role === "admin") {
                router.replace("/admin");
            } else if (role === "tailor") {
                router.replace("/tailor/dashboard");
            } else {
                router.replace("/");
            }
        }
    }, [user, isLoading, router]);

    // Show loading spinner while checking auth or during redirect
    if (isLoading || user) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#FFFDF9]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-black/60 text-sm">Redirecting...</p>
                </div>
            </div>
        );
    }

    // Only render the login form when user is definitely not logged in
    return <LoginForm />;
}