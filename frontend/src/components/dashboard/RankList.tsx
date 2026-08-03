"use client";

import { motion } from "framer-motion";

export type RankItem = {
  id: string;
  name: string;
  value: number;
  meta?: string;
};

type RankListProps = {
  title: string;
  items: RankItem[];
  formatValue: (n: number) => string;
  emptyLabel?: string;
  delay?: number;
};

export default function RankList({
  title,
  items,
  formatValue,
  emptyLabel = "No data yet",
  delay = 0,
}: RankListProps) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className="rounded-[var(--dash-radius)] border border-[var(--dash-border)] bg-[var(--dash-surface)] p-5 shadow-sm sm:p-6"
    >
      <h3 className="[font-family:var(--font-display)] mb-4 text-lg text-[var(--dash-ink)]">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="py-8 text-center text-xs text-[var(--dash-muted)]">
          {emptyLabel}
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li key={item.id || idx}>
              <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                <span className="truncate text-[var(--dash-ink)]">
                  <span className="mr-2 text-[var(--dash-muted)]">
                    {idx + 1}.
                  </span>
                  {item.name}
                </span>
                <span className="shrink-0 font-medium text-[var(--dash-ink)]">
                  {formatValue(item.value)}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-[var(--dash-border)]">
                <div
                  className="h-full rounded-full bg-[var(--dash-gold)] transition-all duration-700"
                  style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
                />
              </div>
              {item.meta && (
                <p className="mt-0.5 text-[10px] text-[var(--dash-muted)]">
                  {item.meta}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
