import { getTranslations } from "next-intl/server";
import { orderTrackingPreview, type OrderTimelineStepId } from "@/lib/mock/homepage";

const STEP_IDS: OrderTimelineStepId[] = [
  "confirmed",
  "fabric",
  "atelier",
  "delivery",
];

const STEP_ICONS: Record<OrderTimelineStepId, string> = {
  confirmed: "shopping_cart",
  fabric: "inventory_2",
  atelier: "content_cut",
  delivery: "local_shipping",
};

type StepState = "completed" | "active" | "pending";

function getStepState(stepIndex: number, activeStep: number): StepState {
  if (stepIndex < activeStep) return "completed";
  if (stepIndex === activeStep) return "active";
  return "pending";
}

type TimelineStepProps = {
  stepId: OrderTimelineStepId;
  title: string;
  subtitle: string;
  state: StepState;
};

function TimelineStep({ stepId, title, subtitle, state }: TimelineStepProps) {
  const isActive = state === "active";
  const isPending = state === "pending";

  return (
    <div
      className={`flex flex-row md:flex-col items-center text-center gap-3 xs:gap-4 sm:gap-5 md:gap-4 w-full md:w-auto justify-start md:justify-center ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <div
        className={`w-10 xs:w-11 sm:w-12 md:w-10 lg:w-11 xl:w-12 h-10 xs:h-11 sm:h-12 md:h-10 lg:h-11 xl:h-12 rounded-full border flex items-center justify-center bg-white flex-shrink-0 ${
          isActive
            ? "border-[var(--color-black)] text-[var(--color-black)] animate-pulse"
            : isPending
              ? "border-[var(--color-border)] text-[var(--color-grey-muted)]"
              : "border-[var(--color-border)] text-[var(--color-black)]"
        }`}
        aria-current={isActive ? "step" : undefined}
      >
        <span
          className="material-symbols-outlined text-[16px] xs:text-[18px] sm:text-[20px] md:text-[18px] lg:text-[20px]"
          aria-hidden="true"
        >
          {STEP_ICONS[stepId]}
        </span>
      </div>
      <div className="text-left md:text-center">
        <p
          className={`[font-family:var(--font-ui)] text-[9px] xs:text-[10px] sm:text-[11px] md:text-[9px] lg:text-[10px] xl:text-[11px] uppercase tracking-[0.28em] font-medium ${
            isPending ? "text-[var(--color-grey-muted)]" : "text-[var(--color-black)]"
          }`}
        >
          {title}
        </p>
        <p className="[font-family:var(--font-ui)] text-[8px] xs:text-[9px] sm:text-[10px] md:text-[8px] lg:text-[9px] text-[var(--color-grey-muted)] mt-0.5 xs:mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

export async function OrderTimeline() {
  const t = await getTranslations("OrderTimeline");
  const { activeStep } = orderTrackingPreview;

  return (
    <section
      id="order-tracking"
      className="py-12 xs:py-16 sm:py-20 md:py-24 lg:py-[var(--space-80)] px-4 xs:px-6 sm:px-8 md:px-12 lg:px-[var(--space-40)] max-w-[var(--container-max,1440px)] mx-auto"
      aria-label={t("ariaLabel")}
    >
      <div className="p-5 xs:p-6 sm:p-8 md:p-10 lg:p-12 border border-[var(--color-border)] relative overflow-hidden bg-white/40 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 xs:mb-10 sm:mb-12 md:mb-14 gap-4 xs:gap-5 md:gap-0">
          <div>
            <h2 className="[font-family:var(--font-display)] text-[24px] xs:text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px] xl:text-[44px] 2xl:text-[48px] font-normal tracking-[-0.02em] text-[var(--color-black)] leading-[1.1]">
              {t("title")}
            </h2>
            <p className="[font-family:var(--font-ui)] text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] lg:text-[12px] xl:text-[13px] uppercase tracking-[0.28em] text-[var(--color-grey-muted)] mt-2 xs:mt-2.5 sm:mt-3">
              {t("orderMeta")}
            </p>
          </div>

          <div className="mt-0 self-start md:self-auto px-3 xs:px-3.5 sm:px-4 py-1.5 xs:py-1.5 sm:py-2 border border-[var(--color-border)] text-[8px] xs:text-[9px] sm:text-[10px] md:text-[11px] tracking-[0.28em] uppercase text-[var(--color-black)] font-normal whitespace-nowrap max-w-full">
            {t("estimatedCompletion")}
          </div>
        </div>

        <div
          className="relative px-2 xs:px-3 sm:px-4"
          role="list"
          aria-label={t("stepsAriaLabel")}
        >
          <div
            className="absolute top-1/2 inset-x-0 h-px bg-[var(--color-border)] hidden md:block -z-10"
            aria-hidden="true"
          />

          <div
            className="absolute start-5 xs:start-[1.375rem] sm:start-6 top-12 bottom-12 w-px bg-[var(--color-border)] block md:hidden -z-10"
            aria-hidden="true"
          />

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6 xs:gap-8 sm:gap-10 md:gap-6 lg:gap-8 xl:gap-10">
            {STEP_IDS.map((stepId, index) => (
              <div key={stepId} role="listitem" className="w-full md:w-auto">
                <TimelineStep
                  stepId={stepId}
                  title={t(`steps.${stepId}.title`)}
                  subtitle={t(`steps.${stepId}.subtitle`)}
                  state={getStepState(index, activeStep)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
