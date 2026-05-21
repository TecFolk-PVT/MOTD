import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

const primaryCtaClass =
  "[font-family:var(--font-ui)] text-[10px] xs:text-[11px] sm:text-[12px] md:text-[11px] lg:text-[11px] xl:text-[12px] uppercase tracking-[0.24em] bg-white text-[var(--color-black)] px-5 xs:px-6 sm:px-7 py-[10px] xs:py-[12px] sm:py-[13px] hover:opacity-80 transition-opacity duration-150 inline-block";

const secondaryCtaClass =
  "[font-family:var(--font-ui)] text-[10px] xs:text-[11px] sm:text-[12px] md:text-[11px] lg:text-[11px] xl:text-[12px] uppercase tracking-[0.24em] bg-transparent text-white border border-white/40 px-5 xs:px-6 sm:px-7 py-[10px] xs:py-[12px] sm:py-[13px] hover:bg-white hover:text-[var(--color-black)] transition-all duration-150 inline-block";

export async function HeroSection() {
  const t = await getTranslations("Hero");

  return (
    <section
      className="relative flex min-h-[100dvh] min-h-[100svh] sm:min-h-[90vh] flex-col justify-end bg-[var(--color-near-black)] overflow-hidden pt-16 sm:pt-24 md:pt-28 lg:min-h-[90vh] lg:pt-0"
      aria-label={t("ariaLabel")}
    >
      {/* opacity-30 + near-black section bg = full-image tint (matches Design/index.html / Netlify) */}
      <img
        src="/images/hero-1.png"
        alt={t("imageAlt")}
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />

      <div className="relative z-10 mt-auto w-full border-white/10 px-4 sm:px-8 md:px-12 lg:px-[var(--space-40)] pb-8 sm:pb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 sm:gap-10">
        <div className="max-w-[560px] w-full lg:w-auto">
          <span className="[font-family:var(--font-ui)] text-[8px] sm:text-[10px] md:text-[9px] lg:text-[9px] xl:text-[10px] uppercase tracking-[0.28em] text-white/60 mb-3 sm:mb-4 flex items-center gap-3">
            <span className="block w-4 sm:w-5 h-px bg-white/40" aria-hidden="true" />
            {t("eyebrow")}
          </span>

          <h1 className="[font-family:var(--font-display)] text-[32px] sm:text-[44px] md:text-[48px] lg:text-[52px] xl:text-[56px] 2xl:text-[64px] 3xl:text-[72px] font-normal leading-[1.1] sm:leading-[1.06] md:leading-[1.05] tracking-[-0.01em] text-white mb-4 sm:mb-5">
            {t("headlineLine1")}
            <br />
            <em className="italic">{t("headlineLine2")}</em>
          </h1>

          <p className="[font-family:var(--font-body)] text-[11px] sm:text-[13px] md:text-[12px] lg:text-[12px] xl:text-[13px] 2xl:text-[14px] leading-[1.7] sm:leading-[1.9] text-white/60 max-w-[400px] w-full mb-6 sm:mb-8">
            {t("body")}
          </p>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Link href="/#fabrics" className={primaryCtaClass}>
              {t("ctaShopNow")}
            </Link>
            <Link href="/#tailors" className={secondaryCtaClass}>
              {t("ctaMeetTailors")}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
