import { Link } from "@/i18n/navigation";
import type { ArtisanTailor } from "@/lib/mock/homepage";

type TailorCardProps = {
  tailor: ArtisanTailor;
  imageAlt: string;
  badge: string;
  name: string;
  location: string;
  description: string;
  reviewCountLabel: string;
  bookConsultationLabel: string;
};

export function TailorCard({
  tailor,
  imageAlt,
  badge,
  name,
  location,
  description,
  reviewCountLabel,
  bookConsultationLabel,
}: TailorCardProps) {
  return (
    <article className="group bg-[var(--bg-page)] border border-[var(--color-border)] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
      <div className="aspect-[4/5] relative overflow-hidden">
        <img
          src={tailor.image}
          alt={imageAlt}
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute bottom-4 xs:bottom-5 left-4 xs:left-5">
          <span className="[font-family:var(--font-ui)] text-[9px] xs:text-[10px] sm:text-[11px] md:text-[10px] lg:text-[11px] uppercase tracking-[0.24em] bg-[var(--color-black)] text-white px-2.5 xs:px-3 py-1 xs:py-1.5">
            {badge}
          </span>
        </div>
      </div>

      <div className="p-5 xs:p-6 sm:p-7 md:p-8 lg:p-6 xl:p-8">
        <div className="mb-4 xs:mb-5">
          <h3 className="[font-family:var(--font-display)] text-[20px] xs:text-[22px] sm:text-[24px] md:text-[22px] lg:text-[24px] xl:text-[26px] 2xl:text-[28px] font-normal leading-[1.2] tracking-[-0.01em] text-[var(--color-black)] mb-1.5">
            {name}
          </h3>
          <p className="[font-family:var(--font-ui)] text-[10px] xs:text-[11px] sm:text-[12px] md:text-[11px] lg:text-[12px] uppercase tracking-[0.24em] text-[var(--color-grey-muted)]">
            {location}
          </p>
        </div>

        <p className="[font-family:var(--font-ui)] text-[12px] xs:text-[13px] sm:text-[14px] md:text-[13px] lg:text-[14px] xl:text-[15px] leading-[1.5] xs:leading-[1.6] text-[var(--color-grey-muted)] mb-5 xs:mb-6">
          {description}
        </p>

        <div className="flex items-center justify-between pt-4 xs:pt-5 border-t border-[var(--color-border)]">
          <div>
            <span className="[font-family:var(--font-ui)] text-[9px] xs:text-[10px] sm:text-[11px] font-medium tracking-[0.2em] text-[var(--color-black)]">
              ★ {tailor.rating.toFixed(1)}
            </span>
            <span className="[font-family:var(--font-ui)] text-[9px] uppercase tracking-[0.2em] text-[var(--color-grey-muted)] ms-1">
              {reviewCountLabel}
            </span>
          </div>
          <Link
            href={`/tailors/${tailor.slug}`}
            className="[font-family:var(--font-ui)] text-[9px] xs:text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-[var(--color-black)] border-b border-[var(--color-black)] pb-0.5 hover:opacity-50 transition"
          >
            {bookConsultationLabel}
          </Link>
        </div>
      </div>
    </article>
  );
}
