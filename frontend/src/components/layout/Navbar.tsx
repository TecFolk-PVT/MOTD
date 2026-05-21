"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const NAV_LINKS = [
  { key: "fabric", href: "/#fabrics" },
  { key: "customClothing", href: "/#custom-clothing" },
  { key: "howItWorks", href: "/#how-it-works" },
  { key: "collections", href: "/#collections" },
  { key: "tailors", href: "/#tailors" },
  { key: "stories", href: "/#stories" },
] as const;

const MOBILE_NAV_LINKS = [
  { key: "fabricStore", href: "/#fabrics" },
  { key: "customClothing", href: "/#custom-clothing" },
  { key: "howItWorks", href: "/#how-it-works" },
  { key: "collections", href: "/#collections" },
  { key: "tailors", href: "/#tailors" },
  { key: "stories", href: "/#stories" },
] as const;

const navLinkClass =
  "[font-family:var(--font-ui)] text-[9px] xs:text-[10px] lg:text-[10px] xl:text-[11px] 2xl:text-[12px] 3xl:text-[13px] uppercase tracking-[0.22em] text-[var(--color-black)] hover:opacity-50 transition whitespace-nowrap";

const mobileNavLinkClass =
  "text-[11px] xs:text-[12px] sm:text-[13px] uppercase tracking-[0.22em] [font-family:var(--font-ui)] hover:opacity-50 transition";

const mobileIconLabelClass =
  "text-[8px] xs:text-[9px] uppercase tracking-[0.18em] [font-family:var(--font-ui)]";

const mobileNavIconClass =
  "flex flex-col items-center gap-1 group hover:opacity-50 transition";

function MaterialIcon({
  name,
  variant = "desktop",
}: {
  name: string;
  variant?: "desktop" | "mobile";
}) {
  const sizeClass =
    variant === "mobile"
      ? "text-[18px] xs:text-[20px] sm:text-[22px]"
      : "text-[16px] lg:text-[18px] xl:text-[20px] 2xl:text-[22px]";

  return <span className={`material-symbols-outlined ${sizeClass}`}>{name}</span>;
}

export function Navbar() {
  const t = useTranslations("Navbar");
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = useCallback(() => {
    setMobileOpen((open) => !open);
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <nav
      className="fixed top-0 inset-x-0 w-full z-50 border-b border-[var(--color-border)] nav-blur"
      aria-label={t("ariaLabel")}
    >
      <div className="w-full min-h-[56px] xs:min-h-[60px] sm:min-h-[64px] md:min-h-[72px] flex items-center justify-between px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-16 3xl:px-24 4xl:px-32">
        <Link href="/" className="shrink-0 flex items-center" onClick={closeMobile}>
          <img
            src="/PNG/Black/MOTD_Wordmark_Black.png"
            alt={t("logoAlt")}
            className="h-[12px] xs:h-[13px] sm:h-[14px] md:h-[16px] lg:h-[18px] xl:h-[20px] 2xl:h-[22px] 3xl:h-[24px] w-auto object-contain"
          />
        </Link>

        <ul className="hidden lg:flex items-center gap-4 xl:gap-6 2xl:gap-8 3xl:gap-10 4xl:gap-12 list-none m-0 p-0">
          {NAV_LINKS.map(({ key, href }) => (
            <li key={key}>
              <Link href={href} className={navLinkClass}>
                {t(`links.${key}`)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 md:gap-5 lg:gap-4 xl:gap-5 2xl:gap-6">
          <button
            type="button"
            className="hidden lg:flex p-1.5 lg:p-2 hover:opacity-50 transition"
            aria-label={t("actions.search")}
          >
            <MaterialIcon name="search" />
          </button>

          <Link
            href="/login"
            className="hidden lg:flex p-1.5 lg:p-2 hover:opacity-50 transition"
            aria-label={t("actions.account")}
          >
            <MaterialIcon name="person" />
          </Link>

          <button
            type="button"
            className="hidden lg:flex p-1.5 lg:p-2 hover:opacity-50 transition"
            aria-label={t("actions.wishlist")}
          >
            <MaterialIcon name="favorite" />
          </button>

          <Link
            href="/cart"
            className="hidden lg:flex p-1.5 lg:p-2 hover:opacity-50 transition"
            aria-label={t("actions.cart")}
          >
            <MaterialIcon name="shopping_bag" />
          </Link>

          <button
            type="button"
            id="hamburger-btn"
            className="lg:hidden flex flex-col gap-[3.5px] xs:gap-[4px] p-1.5 xs:p-2"
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? t("actions.closeMenu") : t("actions.openMenu")}
            onClick={toggleMobile}
          >
            <span className="block w-4 xs:w-5 h-px bg-black" />
            <span className="block w-4 xs:w-5 h-px bg-black" />
            <span className="block w-4 xs:w-5 h-px bg-black" />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`lg:hidden border-t border-[var(--color-border)] bg-white ${mobileOpen ? "" : "hidden"}`}
        aria-hidden={!mobileOpen}
      >
        <div className="px-4 xs:px-5 sm:px-6 py-5 xs:py-6 sm:py-7">
          <ul className="flex flex-col gap-4 xs:gap-5 sm:gap-6 mb-5 xs:mb-6 sm:mb-7 list-none m-0 p-0">
            {MOBILE_NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <Link href={href} className={mobileNavLinkClass} onClick={closeMobile}>
                  {t(`links.${key}`)}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex justify-between items-center border-t border-[var(--color-border)] pt-4 xs:pt-5">
            <button
              type="button"
              className={mobileNavIconClass}
              aria-label={t("actions.search")}
              onClick={closeMobile}
            >
              <MaterialIcon name="search" variant="mobile" />
              <span className={mobileIconLabelClass}>{t("actions.search")}</span>
            </button>
            <Link
              href="/login"
              className={mobileNavIconClass}
              aria-label={t("actions.account")}
              onClick={closeMobile}
            >
              <MaterialIcon name="person" variant="mobile" />
              <span className={mobileIconLabelClass}>{t("actions.account")}</span>
            </Link>
            <Link
              href="/cart"
              className={mobileNavIconClass}
              aria-label={t("actions.cart")}
              onClick={closeMobile}
            >
              <MaterialIcon name="shopping_bag" variant="mobile" />
              <span className={mobileIconLabelClass}>{t("actions.cart")}</span>
            </Link>
            <button
              type="button"
              className={mobileNavIconClass}
              aria-label={t("actions.wishlist")}
              onClick={closeMobile}
            >
              <MaterialIcon name="favorite" variant="mobile" />
              <span className={mobileIconLabelClass}>{t("actions.wishlist")}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
