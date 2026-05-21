import { getTranslations } from "next-intl/server";

const TRUST_ITEMS = [
  { key: "securePayments", icon: "lock" },
  { key: "verifiedTailors", icon: "verified" },
  { key: "premiumFabrics", icon: "auto_awesome" },
  { key: "fastDelivery", icon: "speed" },
] as const;

const labelClass =
  "[font-family:var(--font-ui)] text-[9px] xs:text-[10px] sm:text-[11px] md:text-[12px] lg:text-[13px] xl:text-[14px] uppercase tracking-[0.28em] text-[var(--color-grey-muted)] font-normal";

const iconClass =
  "material-symbols-outlined text-[18px] xs:text-[19px] sm:text-[20px] md:text-[22px] lg:text-[24px] xl:text-[26px] text-[var(--color-grey-muted)] group-hover:text-[var(--color-black)] transition-colors duration-300";

const circleClass =
  "w-12 xs:w-[3.25rem] sm:w-14 md:w-[3.75rem] lg:w-16 xl:w-[4.5rem] h-12 xs:h-[3.25rem] sm:h-14 md:h-[3.75rem] lg:h-16 xl:h-[4.5rem] rounded-full bg-[var(--color-border-subtle)] border border-[var(--color-border)]/40 flex items-center justify-center transition-all duration-300 group-hover:border-[var(--color-black)]/40 group-hover:scale-105";

export async function TrustBar() {
  const t = await getTranslations("TrustBar");

  return (
    <section
      className="w-full bg-[var(--bg-surface)] border-t border-[var(--color-border)]/40 py-8 xs:py-10 sm:py-12 md:py-14 lg:py-16"
      aria-label={t("ariaLabel")}
    >
      <div className="w-full px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] mx-auto">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 xs:gap-8 sm:gap-10 md:gap-12 lg:gap-14 xl:gap-16 text-center list-none m-0 p-0">
          {TRUST_ITEMS.map(({ key, icon }) => (
            <li key={key}>
              <div className="flex flex-col items-center gap-3 xs:gap-3.5 sm:gap-4 group">
                <div className={circleClass}>
                  <span className={iconClass} aria-hidden="true">
                    {icon}
                  </span>
                </div>
                <span className={labelClass}>{t(`items.${key}`)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
