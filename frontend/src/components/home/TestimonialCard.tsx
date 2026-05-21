type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
  rating: number;
};

export function TestimonialCard({ quote, name, role, rating }: TestimonialCardProps) {
  return (
    <article className="p-5 xs:p-6 sm:p-7 md:p-8 lg:p-10 border border-[var(--color-border)] bg-white/60 backdrop-blur-sm flex flex-col justify-between h-full transition-all duration-300 hover:shadow-lg">
      <div className="mb-6 xs:mb-7 sm:mb-8 md:mb-9 lg:mb-10">
        <div
          className="flex gap-0.5 xs:gap-1 mb-4 xs:mb-5 sm:mb-6 text-[var(--color-grey-muted)] opacity-70"
          aria-label={`${rating} out of 5 stars`}
        >
          {Array.from({ length: rating }, (_, index) => (
            <span
              key={index}
              className="material-symbols-outlined text-[12px] xs:text-[13px] sm:text-[14px]"
              aria-hidden="true"
            >
              star
            </span>
          ))}
        </div>

        <blockquote className="[font-family:var(--font-ui)] text-[11px] xs:text-[12px] sm:text-[13px] md:text-[12px] lg:text-[13px] xl:text-[14px] leading-[1.6] xs:leading-[1.7] sm:leading-[1.8] md:leading-[1.9] italic text-[var(--color-grey-muted)] font-normal m-0">
          &ldquo;{quote}&rdquo;
        </blockquote>
      </div>

      <footer>
        <p className="[font-family:var(--font-display)] text-[15px] xs:text-[16px] sm:text-[17px] md:text-[16px] lg:text-[17px] xl:text-[18px] 2xl:text-[20px] font-normal tracking-[-0.01em] text-[var(--color-black)] leading-[1.2] uppercase">
          {name}
        </p>
        <p className="[font-family:var(--font-ui)] text-[7px] xs:text-[8px] sm:text-[9px] md:text-[8px] lg:text-[9px] xl:text-[10px] uppercase tracking-[0.28em] text-[var(--color-grey-muted)] mt-1.5 xs:mt-2">
          {role}
        </p>
      </footer>
    </article>
  );
}
