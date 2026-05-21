import type { Locale } from "@/i18n/routing";

const localeToIntl: Record<Locale, string> = {
  en: "en-AE",
  ar: "ar-AE",
};

export function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(localeToIntl[locale], {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatPhoneE164(localDigits: string): string {
  const digits = localDigits.replace(/\D/g, "");
  return digits.startsWith("971") ? `+${digits}` : `+971${digits}`;
}
