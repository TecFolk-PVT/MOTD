// app/[locale]/auth/login/page.tsx
"use client";

import { useEffect, useRef } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { navigateAfterLogin } from "@/lib/auth/postLoginRedirect";
import LoginForm from "../../../../components/auth/loginForm";

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const locale = (params.locale as string) || "en";
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isLoading || !user || hasRedirected.current) return;
    hasRedirected.current = true;
    navigateAfterLogin(user, redirectUrl, locale);
  }, [user, isLoading, redirectUrl, locale]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFDF9]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black/60 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FFFDF9]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-black/60 text-sm">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <LoginForm />;
}
