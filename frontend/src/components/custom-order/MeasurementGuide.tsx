import { getTranslations } from "next-intl/server";

const TIP_KEYS = ["tape", "clothing", "posture", "keyAreas"] as const;

export async function MeasurementGuide() {
  const t = await getTranslations("MeasurementGuide");

  return (
    <section
      id="how-it-works"
      className="bg-black/95 text-white py-12 xs:py-16 sm:py-20 md:py-24 lg:py-[var(--space-80)] relative overflow-hidden"
      aria-label={t("ariaLabel")}
    >
      <div
        className="absolute end-0 top-0 w-1/2 sm:w-2/5 md:w-1/3 h-full bg-white/5 -skew-x-12 translate-x-1/2 rtl:-translate-x-1/2"
        aria-hidden="true"
      />
      <div
        className="absolute start-0 bottom-0 w-64 h-64 bg-white/[0.02] rounded-full blur-3xl"
        aria-hidden="true"
      />

      <div className="px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] w-full mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 xs:gap-10 sm:gap-12 md:gap-14 lg:gap-[var(--space-64)] items-start lg:items-center">
          <div>
            <span className="[font-family:var(--font-ui)] text-[7px] xs:text-[8px] sm:text-[9px] md:text-[8px] lg:text-[9px] xl:text-[10px] uppercase tracking-[0.28em] text-[var(--color-grey-muted)] mb-2 xs:mb-3 flex items-center gap-2 xs:gap-3">
              <span className="block w-3 xs:w-4 sm:w-5 h-px bg-[var(--color-grey-muted)]" aria-hidden="true" />
              {t("eyebrow")}
            </span>

            <h2 className="[font-family:var(--font-display)] text-[32px] xs:text-[36px] sm:text-[40px] md:text-[44px] lg:text-[48px] xl:text-[52px] 2xl:text-[56px] font-normal leading-[1.1] xs:leading-[1.12] sm:leading-[1.1] tracking-[-0.02em] text-white mb-4 xs:mb-5 sm:mb-6 md:mb-8">
              {t("titleLine1")}
              <br />
              {t("titleLine2")}
            </h2>

            <p className="[font-family:var(--font-ui)] text-[13px] xs:text-[14px] sm:text-[15px] md:text-[16px] lg:text-[17px] xl:text-[18px] leading-[1.5] xs:leading-[1.6] text-white/60 mb-8 xs:mb-10 sm:mb-12 max-w-lg">
              {t("description")}
            </p>

            <ol className="space-y-5 xs:space-y-6 sm:space-y-7 md:space-y-8 list-none p-0 m-0">
              {TIP_KEYS.map((key, index) => (
                <li key={key} className="flex gap-3 xs:gap-4 items-start group">
                  <div
                    className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-white/20 transition-colors"
                    aria-hidden="true"
                  >
                    <span className="text-[10px] xs:text-[11px] text-white/80">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="[font-family:var(--font-display)] text-[14px] xs:text-[15px] sm:text-[16px] md:text-[17px] font-normal text-white mb-1">
                      {t(`tips.${key}.title`)}
                    </h3>
                    <p className="[font-family:var(--font-ui)] text-[11px] xs:text-[12px] sm:text-[13px] leading-relaxed text-white/50">
                      {t(`tips.${key}.description`)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <a
              href="/images/mer-1.png"
              download="motd-measurement-guide.png"
              className="mt-8 xs:mt-10 sm:mt-12 px-6 xs:px-7 sm:px-8 py-3 xs:py-3.5 sm:py-4 bg-white text-black [font-family:var(--font-ui)] text-[9px] xs:text-[10px] sm:text-[11px] uppercase tracking-[0.28em] hover:bg-white/90 transition-all duration-300 inline-flex items-center gap-2"
            >
              {t("downloadCta")}
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                download
              </span>
            </a>
          </div>

          <div className="relative mt-8 lg:mt-0">
            <div
              className="absolute -top-4 -start-4 w-full h-full border border-white/10 pointer-events-none"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-4 -end-4 w-full h-full border border-white/5 pointer-events-none"
              aria-hidden="true"
            />

            <div className="relative bg-white/[0.03] backdrop-blur-sm border border-white/10 p-4 xs:p-5 sm:p-6 md:p-8">
              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
                <img
                  src="/images/mer-1.png"
                  alt={t("imageAlt")}
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
