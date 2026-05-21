import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { artisanTailors } from "@/lib/mock/homepage";
import { TailorCard } from "./TailorCard";

export async function TailorGrid() {
  const t = await getTranslations("TailorGrid");

  return (
    <section
      id="tailors"
      className="bg-[var(--bg-page)] py-12 xs:py-16 sm:py-20 md:py-24 lg:py-[var(--space-80)] border-b border-[var(--color-border)]"
      aria-label={t("ariaLabel")}
    >
      <div className="px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] w-full mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-10 xs:mb-12 sm:mb-14 md:mb-16 lg:mb-[var(--space-64)]">
          <span className="[font-family:var(--font-ui)] text-[8px] xs:text-[9px] sm:text-[10px] md:text-[9px] lg:text-[10px] xl:text-[11px] uppercase tracking-[0.28em] text-[var(--color-grey-muted)] mb-2 xs:mb-3 flex items-center justify-center gap-2 xs:gap-3">
            <span className="block w-6 xs:w-8 h-px bg-[var(--color-grey-muted)]" aria-hidden="true" />
            {t("eyebrow")}
            <span className="block w-6 xs:w-8 h-px bg-[var(--color-grey-muted)]" aria-hidden="true" />
          </span>

          <h2 className="[font-family:var(--font-display)] text-[32px] xs:text-[38px] sm:text-[42px] md:text-[48px] lg:text-[52px] xl:text-[56px] 2xl:text-[64px] font-normal leading-[1.1] xs:leading-[1.09] sm:leading-[1.08] tracking-[-0.01em] text-[var(--color-black)] mb-3 xs:mb-4">
            {t("title")}
          </h2>

          <p className="[font-family:var(--font-ui)] text-[12px] xs:text-[13px] sm:text-[14px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px] leading-[1.5] xs:leading-[1.6] text-[var(--color-grey-muted)] max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xs:gap-7 sm:gap-8 md:gap-8 lg:gap-10 xl:gap-12">
          {artisanTailors.map((tailor) => (
            <TailorCard
              key={tailor.slug}
              tailor={tailor}
              imageAlt={t(`cards.${tailor.slug}.imageAlt`)}
              badge={t(`cards.${tailor.slug}.badge`)}
              name={t(`cards.${tailor.slug}.name`)}
              location={t(`cards.${tailor.slug}.location`)}
              description={t(`cards.${tailor.slug}.description`)}
              reviewCountLabel={t("reviewCount", { count: tailor.reviewCount })}
              bookConsultationLabel={t("bookConsultation")}
            />
          ))}
        </div>

        <div className="text-center mt-12 xs:mt-14 sm:mt-16 lg:mt-[var(--space-48)] pt-10">
          <Link
            href="/tailors"
            className="[font-family:var(--font-ui)] text-[10px] xs:text-[11px] sm:text-[12px] md:text-[11px] lg:text-[12px] xl:text-[13px] uppercase tracking-[0.28em] text-[var(--color-black)] border-b border-[var(--color-black)] pb-1 xs:pb-1.5 hover:opacity-50 transition-all duration-200 inline-flex items-center gap-2"
          >
            {t("viewAll")}
            <span className="text-[16px] xs:text-[18px] sm:text-[20px] leading-none" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
