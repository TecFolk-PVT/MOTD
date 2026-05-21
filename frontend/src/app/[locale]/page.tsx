import { setRequestLocale } from "next-intl/server";
import { MeasurementGuide } from "@/components/custom-order/MeasurementGuide";
import { FabricCarousel } from "@/components/fabrics/FabricCarousel";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { HeroSection } from "@/components/home/HeroSection";
import { PartnerSection } from "@/components/home/PartnerSection";
import { Testimonials } from "@/components/home/Testimonials";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { ProductCarousel } from "@/components/ready-made/ProductCarousel";
import { TailorGrid } from "@/components/tailors/TailorGrid";
import type { Locale } from "@/i18n/routing";

type Props = {
  params: { locale: Locale };
};

/**
 * Homepage — section order matches Design/index.html exactly.
 * Navbar (1), TrustBar (12), and Footer (13) live in [locale]/layout.tsx.
 */
export default async function HomePage({ params: { locale } }: Props) {
  setRequestLocale(locale);

  return (
    <main>
      {/* 2. Hero — Mukhawara of the Day */}
      <HeroSection />
      {/* 3. Elite Collections */}
      <CategoryGrid />
      {/* 4. Premium Fabrics carousel — ready-made (collectionItems) */}
      <ProductCarousel />
      {/* 5. Featured Banners carousel — 6 slides */}
      <BannerCarousel />
      {/* 6. Ready to Wear carousel — fabrics (fabricsCollection, AED/m) */}
      <FabricCarousel />
      {/* 7. Meet the Tailors */}
      <TailorGrid />
      {/* 8. Measure with Confidence */}
      <MeasurementGuide />
      {/* 9. The Client Experience */}
      <Testimonials />
      {/* 10. Craft Progress timeline */}
      <OrderTimeline />
      {/* 11. Vendor Portal + Newsletter */}
      <PartnerSection />
    </main>
  );
}
