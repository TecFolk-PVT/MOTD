import type { Locale } from "@/i18n/routing";

export interface TailorShopListItem {
    _id: string;
    slug: string;
    name: string;
    nameAr?: string;
    description?: string;
    descriptionAr?: string;
    logo?: string;
    coverImage?: string;
    location?: string;
    city?: string;
    phone?: string;
    rating?: number;
    reviewCount?: number;
    ownerId?: string;
}

const DEFAULT_TAILOR_IMAGE = "/images/tailor-1.png";

export function resolveTailorImage(
    logo?: string,
    coverImage?: string,
): string {
    return logo?.trim() || coverImage?.trim() || DEFAULT_TAILOR_IMAGE;
}

export function getTailorDisplayFields(
    item: Pick<
        TailorShopListItem,
        "name" | "nameAr" | "description" | "descriptionAr" | "city" | "location"
    >,
    locale: Locale,
) {
    const isAr = locale === "ar";
    const city = item.city?.trim() || "";
    const location = item.location?.trim() || "";

    const locationParts = [city, location].filter(Boolean);

    return {
        name: isAr ? item.nameAr || item.name : item.name,
        description: isAr
            ? item.descriptionAr || item.description || ""
            : item.description || "",
        location: isAr
            ? locationParts.join("، ")
            : locationParts.join(", ").toUpperCase(),
        badge: city ? (isAr ? city : city.toUpperCase()) : "",
    };
}

export function formatTailorRating(rating = 0): string {
    return Number(rating).toFixed(1);
}
