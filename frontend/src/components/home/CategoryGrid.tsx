import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { eliteCategories } from "@/lib/mock/homepage";

export async function CategoryGrid() {
  const t = await getTranslations("CategoryGrid");

  return (
    <section
      id="collections"
      className="bg-[var(--bg-page)] py-12 xs:py-16 sm:py-20 md:py-24 lg:py-[var(--space-80)] border-[var(--color-border)]"
      aria-label={t("ariaLabel")}
    >
      <div className="w-full px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 xs:mb-10 sm:mb-12 pb-4 xs:pb-5 sm:pb-6 border-b border-[var(--color-border)] gap-4 sm:gap-0">
          <div>
            <span className="[font-family:var(--font-ui)] text-[8px] xs:text-[9px] sm:text-[10px] md:text-[9px] lg:text-[9px] xl:text-[10px] uppercase tracking-[0.28em] text-[var(--color-grey-muted)] mb-2 xs:mb-3 flex items-center gap-2 xs:gap-3">
              <span className="block w-4 xs:w-5 h-px bg-[var(--color-grey-muted)]" aria-hidden="true" />
              {t("eyebrow")}
            </span>

            <h2 className="[font-family:var(--font-display)] text-[28px] xs:text-[32px] sm:text-[36px] md:text-[40px] lg:text-[36px] xl:text-[42px] 2xl:text-[48px] font-normal leading-[1.1] xs:leading-[1.09] sm:leading-[1.08] tracking-[-0.01em] text-[var(--color-black)]">
              {t("titleLine1")}
              <br />
              {t("titleLine2")}
            </h2>
          </div>

          <Link
            href="/#collections"
            className="[font-family:var(--font-ui)] text-[8px] xs:text-[9px] sm:text-[10px] md:text-[9px] lg:text-[9px] xl:text-[10px] uppercase tracking-[0.24em] text-[var(--color-black)] flex items-center gap-2 shrink-0 pb-[2px] xs:pb-[3px] border-b border-[var(--color-black)] hover:opacity-50 transition-opacity duration-150 self-start sm:self-auto"
          >
            {t("viewAll")}
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 xs:gap-4 sm:gap-5 md:gap-4 lg:gap-4 xl:gap-5">
          {eliteCategories.map(({ slug, number, image }) => (
            <Link key={slug} href="#" className="group block">
              <div className="aspect-[4/5] overflow-hidden bg-[var(--color-border)] mb-2 xs:mb-3 relative">
                <img
                  src={image}
                  alt={t(`imageAlt.${slug}`)}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-black/[0.04] group-hover:bg-black/0 transition-colors duration-300" />
                <span className="absolute top-[8px] xs:top-[10px] left-[8px] xs:left-[10px] [font-family:var(--font-ui)] text-[6px] xs:text-[7px] sm:text-[8px] tracking-[0.2em] text-white/70">
                  {number}
                </span>
              </div>
              <span className="[font-family:var(--font-ui)] text-[9px] xs:text-[10px] sm:text-[11px] md:text-[10px] lg:text-[10px] xl:text-[11px] uppercase tracking-[0.24em] text-[var(--color-black)] text-center block pt-[2px] xs:pt-[3px] border-t border-transparent group-hover:border-[var(--color-black)] transition-colors duration-200">
                {t(`items.${slug}`)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
