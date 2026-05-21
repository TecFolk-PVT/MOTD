import { getTranslations } from "next-intl/server";
import { Newsletter } from "./Newsletter";
import { PartnerCTA } from "./PartnerCTA";

export async function PartnerSection() {
  const t = await getTranslations("PartnerSection");

  return (
    <section
      id="partners"
      className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-[var(--space-80)] px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] max-w-[var(--container-max,1440px)] mx-auto"
      aria-label={t("ariaLabel")}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 md:gap-8 lg:gap-10">
        <PartnerCTA />
        <Newsletter />
      </div>
    </section>
  );
}
