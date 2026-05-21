import type { FabricProduct } from "@/lib/mock/homepage";

type FabricCardProps = {
  fabric: FabricProduct;
  width: number;
  marginRight: number;
  viewDetailsLabel: string;
  isLast?: boolean;
};

export function FabricCard({
  fabric,
  width,
  marginRight,
  viewDetailsLabel,
  isLast,
}: FabricCardProps) {
  return (
    <div
      className="fabric-card flex-shrink-0 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
      style={{
        width: `${width}px`,
        marginRight: isLast ? 0 : `${marginRight}px`,
      }}
    >
      <div className="group bg-[var(--bg-page)] border border-[var(--color-border)] overflow-hidden">
        <div className="aspect-[16/9] relative overflow-hidden">
          <img
            src={fabric.img}
            alt={fabric.title}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
            draggable={false}
          />
          {fabric.tag ? (
            <div className="absolute top-3 xs:top-4 left-3 xs:left-4">
              <span
                className={`[font-family:var(--font-ui)] text-[8px] xs:text-[9px] sm:text-[10px] md:text-[9px] lg:text-[10px] xl:text-[11px] uppercase tracking-[0.24em] px-1.5 xs:px-2 py-0.5 xs:py-1 text-white ${fabric.tagColor}`}
              >
                {fabric.tag}
              </span>
            </div>
          ) : null}
        </div>

        <div className="p-4 xs:p-5 sm:p-6 md:p-7 lg:p-[var(--space-24)]">
          <div className="flex flex-col xs:flex-row justify-between items-start gap-2 xs:gap-3 mb-3 xs:mb-4">
            <div className="flex-1">
              <h3 className="[font-family:var(--font-display)] text-[18px] xs:text-[20px] sm:text-[22px] md:text-[20px] lg:text-[22px] xl:text-[24px] 2xl:text-[26px] font-normal leading-[1.2] xs:leading-[1.25] tracking-[-0.01em] text-[var(--color-black)] mb-1">
                {fabric.title}
              </h3>
              <p className="[font-family:var(--font-ui)] text-[8px] xs:text-[9px] sm:text-[10px] md:text-[9px] lg:text-[10px] xl:text-[11px] uppercase tracking-[0.24em] text-[var(--color-grey-muted)]">
                {fabric.location}
              </p>
            </div>
            <span className="[font-family:var(--font-ui)] text-[11px] xs:text-[12px] sm:text-[13px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px] tracking-[0.24em] text-[var(--color-black)] font-normal whitespace-nowrap">
              {fabric.price}
            </span>
          </div>

          <p className="[font-family:var(--font-ui)] text-[11px] xs:text-[12px] sm:text-[13px] md:text-[12px] lg:text-[13px] xl:text-[14px] 2xl:text-[15px] leading-relaxed xs:leading-[1.5] sm:leading-[1.6] text-[var(--color-grey-muted)] line-clamp-2 mb-3 xs:mb-4">
            {fabric.desc}
          </p>

          <button
            type="button"
            className="[font-family:var(--font-ui)] w-full mt-3 xs:mt-4 sm:mt-5 py-3 xs:py-3.5 sm:py-4 border border-[var(--color-border)] text-[9px] xs:text-[10px] sm:text-[11px] md:text-[10px] lg:text-[11px] xl:text-[12px] uppercase tracking-[0.28em] text-[var(--color-black)] hover:bg-[var(--color-black)] hover:text-white transition-all duration-300"
          >
            {viewDetailsLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
