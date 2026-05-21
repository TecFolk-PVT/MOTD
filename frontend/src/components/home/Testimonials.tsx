import { getTranslations } from "next-intl/server";
import { clientTestimonials } from "@/lib/mock/homepage";
import { TestimonialCard } from "./TestimonialCard";

export async function Testimonials() {
  const t = await getTranslations("Testimonials");

  return (
    <section
      id="testimonials"
      className="bg-[var(--bg-page)] py-12 xs:py-16 sm:py-20 md:py-24 lg:py-[var(--space-80)]"
      aria-label={t("ariaLabel")}
    >
      <div className="px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] w-full mx-auto">
        <div className="text-center mb-10 xs:mb-12 sm:mb-14 md:mb-16 lg:mb-20">
          <h2 className="[font-family:var(--font-display)] text-[28px] xs:text-[32px] sm:text-[36px] md:text-[40px] lg:text-[44px] xl:text-[48px] 2xl:text-[56px] font-normal tracking-[-0.02em] text-[var(--color-black)] leading-[1.1] xs:leading-[1.12]">
            {t("title")}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 xs:gap-6 sm:gap-7 md:gap-8 lg:gap-10">
          {clientTestimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.slug}
              quote={t(`cards.${testimonial.slug}.quote`)}
              name={t(`cards.${testimonial.slug}.name`)}
              role={t(`cards.${testimonial.slug}.role`)}
              rating={testimonial.rating}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
