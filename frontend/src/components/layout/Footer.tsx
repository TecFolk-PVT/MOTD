import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const QUICK_LINKS = [
  { key: "home", href: "/" },
  { key: "exploreFabrics", href: "/#fabrics" },
  { key: "tailors", href: "/#tailors" },
  { key: "customDesign", href: "/#custom-clothing" },
  { key: "aboutUs", href: "/#about" },
  { key: "contact", href: "/#contact" },
] as const;

const CUSTOMER_LINKS = [
  { key: "trackOrder", href: "/orders" },
  { key: "shippingPolicy", href: "/shipping" },
  { key: "returnsRefunds", href: "/returns" },
  { key: "measurementGuide", href: "/#how-it-works" },
  { key: "faqs", href: "/faq" },
  { key: "supportCenter", href: "/support" },
] as const;

const BUSINESS_LINKS = [
  { key: "becomeTailor", href: "/partners/tailor" },
  { key: "fabricVendor", href: "/partners/fabric" },
  { key: "shippingPartner", href: "/partners/shipping" },
  { key: "vendorDashboard", href: "/vendor" },
  { key: "partnerships", href: "/partners" },
] as const;

const SOCIAL_LINKS = [
  { key: "instagram", href: "#", icon: "photo_camera" },
  { key: "website", href: "#", icon: "public" },
  { key: "pinterest", href: "#", icon: "interests" },
  { key: "youtube", href: "#", icon: "video_library" },
  { key: "linkedin", href: "#", icon: "work" },
] as const;

const POLICY_LINKS = [
  { key: "privacy", href: "/privacy" },
  { key: "terms", href: "/terms" },
  { key: "cookies", href: "/cookies" },
] as const;

const PAYMENT_ICONS = ["payments", "credit_card", "account_balance"] as const;

const columnHeadingClass =
  "[font-family:var(--font-ui)] text-[14px] xs:text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] xl:text-[16px] uppercase tracking-[0.32em] text-white/80 font-normal py-[15px] xs:py-[20px] sm:py-[25px] md:py-[30px] lg:py-[30px]";

const columnLinkClass =
  "[font-family:var(--font-ui)] text-[14px] xs:text-[12px] sm:text-[13px] md:text-[14px] lg:text-[15px] text-white hover:text-white/60 transition-colors duration-300";

function MaterialIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} aria-hidden="true">
      {name}
    </span>
  );
}

async function FooterLinkColumn({
  title,
  links,
  labelPrefix,
  className,
}: {
  title: string;
  links: readonly { key: string; href: string }[];
  labelPrefix: "quickLinks" | "customerServices" | "business";
  className?: string;
}) {
  const t = await getTranslations("Footer");

  return (
    <div
      className={`flex flex-col gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-[var(--space-28)] ${className ?? ""}`}
    >
      <h3 className={columnHeadingClass}>{title}</h3>
      <ul className="flex flex-col gap-4 xs:gap-3.5 sm:gap-4 md:gap-4.5 lg:gap-5 list-none m-0 p-0">
        {links.map(({ key, href }) => (
          <li key={key}>
            <Link href={href} className={columnLinkClass}>
              {t(`${labelPrefix}.${key}`)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function Footer() {
  const t = await getTranslations("Footer");

  return (
    <footer
      className="w-full bg-black/90 border-t border-white/10 py-12 xs:py-16 sm:py-20 md:py-24 lg:py-[var(--space-80)]"
      aria-label={t("ariaLabel")}
    >
      <div className="w-full px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] mx-auto grid grid-cols-1 md:grid-cols-12 gap-y-10 xs:gap-y-12 sm:gap-y-14 md:gap-y-16 lg:gap-y-[var(--space-64)] gap-x-6 md:gap-x-8 lg:gap-x-[var(--space-48)]">
        {/* Brand column */}
        <div className="md:col-span-12 lg:col-span-4 flex flex-col gap-5 xs:gap-6 sm:gap-7 md:gap-8 lg:gap-[var(--space-32)]">
          <div className="p-[30px]">
            <Link href="/" className="inline-block">
              <img
                src="/PNG/White/MOTD_Wordmark_White.png"
                alt={t("logoAlt")}
                className="w-[140px] xs:w-[160px] sm:w-[180px] md:w-[200px] lg:w-[220px] object-contain brightness-0 invert"
              />
            </Link>
          </div>

          <p className="[font-family:var(--font-display)] text-[22px] xs:text-[24px] sm:text-[26px] md:text-[28px] lg:text-[32px] xl:text-[36px] leading-[1.25] xs:leading-[1.28] sm:leading-[1.3] tracking-[-0.02em] text-white font-normal max-w-[420px]">
            {t("tagline")}
          </p>

          <p className="[font-family:var(--font-ui)] text-[12px] xs:text-[13px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] leading-[1.6] xs:leading-[1.7] sm:leading-[1.8] md:leading-[1.9] text-white/60 max-w-[420px] font-normal">
            {t("description")}
          </p>

          <div className="flex gap-2.5 xs:gap-3 pt-2">
            {SOCIAL_LINKS.map(({ key, href, icon }) => (
              <a
                key={key}
                href={href}
                className="w-9 xs:w-10 sm:w-11 h-9 xs:h-10 sm:h-11 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/80 transition-all duration-300"
                aria-label={t(`social.${key}`)}
              >
                <MaterialIcon
                  name={icon}
                  className="text-[16px] xs:text-[17px] sm:text-[18px]"
                />
              </a>
            ))}
          </div>
        </div>

        <FooterLinkColumn
          title={t("columns.quickLinks")}
          links={QUICK_LINKS}
          labelPrefix="quickLinks"
          className="md:col-span-6 lg:col-span-2"
        />

        <FooterLinkColumn
          title={t("columns.customerServices")}
          links={CUSTOMER_LINKS}
          labelPrefix="customerServices"
          className="md:col-span-6 lg:col-span-3"
        />

        <FooterLinkColumn
          title={t("columns.business")}
          links={BUSINESS_LINKS}
          labelPrefix="business"
          className="md:col-span-12 lg:col-span-3"
        />
      </div>

      {/* Bottom bar */}
      <div className="w-full px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] mx-auto mt-10 xs:mt-12 sm:mt-14 md:mt-16 lg:mt-[var(--space-80)] pt-6 xs:pt-7 sm:pt-8 md:pt-9 lg:pt-[var(--space-32)] border-t border-white/10 flex flex-col lg:flex-row justify-between items-center gap-4 xs:gap-5 lg:gap-6">
        <div className="[font-family:var(--font-ui)] text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] uppercase tracking-[0.28em] text-white/40 text-center lg:text-start">
          {t("copyright")}
        </div>

        <div className="flex flex-wrap justify-center gap-4 xs:gap-5 sm:gap-6 md:gap-7 lg:gap-8">
          {POLICY_LINKS.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              className="[font-family:var(--font-ui)] text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] uppercase tracking-[0.18em] text-white/40 hover:text-white/70 transition-colors duration-300"
            >
              {t(`policies.${key}`)}
            </Link>
          ))}
        </div>

        <div
          className="flex gap-3 xs:gap-3.5 sm:gap-4 text-white/40"
          aria-label={t("paymentMethods")}
        >
          {PAYMENT_ICONS.map((icon) => (
            <MaterialIcon
              key={icon}
              name={icon}
              className="text-[16px] xs:text-[17px] sm:text-[18px]"
            />
          ))}
        </div>
      </div>
    </footer>
  );
}
