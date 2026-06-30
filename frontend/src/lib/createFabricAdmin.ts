export const FABRIC_MATERIALS = [
  { value: "chiffon", en: "Chiffon", ar: "شيفون" },
  { value: "silk velvet", en: "Silk Velvet", ar: "مخمل حرير" },
  {
    value: "tana linen cotton",
    en: "Tana Linen Cotton",
    ar: "تانة قطن الكتان",
  },
] as const;
export type FabricMaterialValue = (typeof FABRIC_MATERIALS)[number]["value"];

export const FABRIC_TAGS = [
  { value: "new", en: "New", ar: "جديد" },
  { value: "bestseller", en: "Bestseller", ar: "الأكثر مبيعاً" },
  { value: "premium", en: "Premium", ar: "ممتاز" },
  { value: "limited", en: "Limited", ar: "محدود" },
  { value: "exclusive", en: "Exclusive", ar: "حصري" }, // replaced Eid Special
  { value: "trending", en: "Trending", ar: "رائج" },
  { value: "handmade", en: "Handmade", ar: "يدوي" },
] as const;
export type FabricTagValue = (typeof FABRIC_TAGS)[number]["value"];

// UAE Emirates (unchanged)
export const UAE_EMIRATES = [
  { value: "abu-dhabi", en: "Abu Dhabi", ar: "أبو ظبي" },
  { value: "dubai", en: "Dubai", ar: "دبي" },
  { value: "sharjah", en: "Sharjah", ar: "الشارقة" },
  { value: "ajman", en: "Ajman", ar: "عجمان" },
  { value: "umm-al-quwain", en: "Umm Al Quwain", ar: "أم القيوين" },
  { value: "ras-al-khaimah", en: "Ras Al Khaimah", ar: "رأس الخيمة" },
  { value: "fujairah", en: "Fujairah", ar: "الفجيرة" },
];

// Color options (unchanged)
export const COLOR_OPTIONS = [
  { value: "black", en: "Black", ar: "أسود" },
  { value: "white", en: "White", ar: "أبيض" },

  { value: "red", en: "Red", ar: "أحمر" },
  { value: "maroon", en: "Maroon", ar: "خمري" },
  { value: "burgundy", en: "Burgundy", ar: "عنابي" },

  { value: "pink", en: "Pink", ar: "وردي" },
  { value: "hot-pink", en: "Hot Pink", ar: "وردي فاقع" },
  { value: "rose", en: "Rose", ar: "وردي فاتح" },

  { value: "purple", en: "Purple", ar: "بنفسجي" },
  { value: "lavender", en: "Lavender", ar: "لافندر" },

  { value: "blue", en: "Blue", ar: "أزرق" },
  { value: "navy", en: "Navy Blue", ar: "كحلي" },
  { value: "royal-blue", en: "Royal Blue", ar: "أزرق ملكي" },
  { value: "sky-blue", en: "Sky Blue", ar: "أزرق سماوي" },
  { value: "turquoise", en: "Turquoise", ar: "فيروزي" },

  { value: "green", en: "Green", ar: "أخضر" },
  { value: "emerald", en: "Emerald Green", ar: "أخضر زمردي" },
  { value: "olive", en: "Olive Green", ar: "أخضر زيتوني" },
  { value: "mint", en: "Mint Green", ar: "أخضر نعناعي" },

  { value: "yellow", en: "Yellow", ar: "أصفر" },
  { value: "mustard", en: "Mustard", ar: "أصفر خردلي" },

  { value: "orange", en: "Orange", ar: "برتقالي" },
  { value: "peach", en: "Peach", ar: "خوخي" },

  { value: "brown", en: "Brown", ar: "بني" },
  { value: "chocolate", en: "Chocolate Brown", ar: "بني شوكولاتة" },
  { value: "beige", en: "Beige", ar: "بيج" },
  { value: "camel", en: "Camel", ar: "جملي" },

  { value: "grey", en: "Grey", ar: "رمادي" },
  { value: "silver", en: "Silver", ar: "فضي" },

  { value: "gold", en: "Gold", ar: "ذهبي" },
  { value: "champagne", en: "Champagne", ar: "شامبين" },
  { value: "bronze", en: "Bronze", ar: "برونزي" },

  { value: "cream", en: "Cream", ar: "كريمي" },
  { value: "ivory", en: "Ivory", ar: "عاجي" },

  { value: "multi", en: "Multi Color", ar: "متعدد الألوان" },
];

export interface PickupAddress {
  emirate: string;
  city: string;
  street: string;
  building: string;
  phone: string;
}

export interface FabricFormData {
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  images: string[];
  material: FabricMaterialValue | "";
  materialAr: string; // stores Arabic label
  colors: string[];
  tag: string; // stores English value
  tagAr: string; // stores Arabic label
  pricePerMeter: number | string;
  stockInMeters: number | string;
  listedByStore: string;
  pickupAddress: PickupAddress;
  isActive: boolean;
}

// ... helper functions (slugFromName, etc.) remain unchanged ...

export function defaultFabricForm(): FabricFormData {
  return {
    name: "",
    nameAr: "",
    slug: "",
    description: "",
    descriptionAr: "",
    images: [""],
    material: "",
    materialAr: "",
    colors: [],
    tag: "",
    tagAr: "",
    pricePerMeter: 0,
    stockInMeters: 0,
    listedByStore: "",
    pickupAddress: {
      emirate: "",
      city: "",
      street: "",
      building: "",
      phone: "",
    },
    isActive: true,
  };
}

export function fromApiFabric(
  product: Record<string, unknown>,
): FabricFormData {
  const defaultForm = defaultFabricForm();

  let material: FabricMaterialValue | "" = "";
  if (typeof product.material === "string") {
    const found = FABRIC_MATERIALS.find((m) => m.value === product.material);
    if (found) material = found.value;
  }

  const materialAr =
    typeof product.materialAr === "string" ? product.materialAr : "";
  const tag = typeof product.tag === "string" ? product.tag : "";
  const tagAr = typeof product.tagAr === "string" ? product.tagAr : "";
  const name = typeof product.name === "string" ? product.name : "";
  const nameAr = typeof product.nameAr === "string" ? product.nameAr : "";
  const slug = typeof product.slug === "string" ? product.slug : "";
  const description =
    typeof product.description === "string" ? product.description : "";
  const descriptionAr =
    typeof product.descriptionAr === "string" ? product.descriptionAr : "";
  const images = Array.isArray(product.images)
    ? product.images.filter((img): img is string => typeof img === "string")
    : defaultForm.images;
  const colors = Array.isArray(product.colors)
    ? product.colors.filter(
        (color): color is string => typeof color === "string",
      )
    : defaultForm.colors;
  const pricePerMeter =
    typeof product.pricePerMeter === "number"
      ? product.pricePerMeter
      : defaultForm.pricePerMeter;
  const stockInMeters =
    typeof product.stockInMeters === "number"
      ? product.stockInMeters
      : defaultForm.stockInMeters;
  const listedByStore =
    typeof product.listedByStore === "string" ? product.listedByStore : "";

  const pickupAddress = (() => {
    // Backend stores these under `storePickupAddress`.
    const source =
      typeof (product as any).storePickupAddress === "object" &&
      (product as any).storePickupAddress !== null
        ? (product as any).storePickupAddress
        : (product as any).pickupAddress; // backward-compat if older docs used `pickupAddress`

    return typeof source === "object" && source !== null
      ? {
          emirate: typeof source.emirate === "string" ? source.emirate : "",
          city: typeof source.city === "string" ? source.city : "",
          street: typeof source.street === "string" ? source.street : "",
          building: typeof source.building === "string" ? source.building : "",
          phone: typeof source.phone === "string" ? source.phone : "",
        }
      : defaultForm.pickupAddress;
  })();
  const isActive =
    typeof product.isActive === "boolean"
      ? product.isActive
      : defaultForm.isActive;

  return {
    name,
    nameAr,
    slug,
    description,
    descriptionAr,
    images,
    material,
    materialAr,
    colors,
    tag,
    tagAr,
    pricePerMeter,
    stockInMeters,
    listedByStore,
    pickupAddress,
    isActive,
  };
}

function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveSlug(form: FabricFormData): string {
  const slug = form.slug.trim();
  return slug || slugFromName(form.name);
}

function isDataUrl(value: string): boolean {
  return /^data:[^,]+,/.test(value.trim());
}

export function toFabricApiPayload(
  form: FabricFormData,
  options?: { includeIsActive?: boolean },
): Record<string, unknown> {
  const name = form.name.trim();

  const payload: Record<string, unknown> = {
    name,
    nameAr: form.nameAr.trim() || name,
    slug: resolveSlug(form),
    description: form.description.trim(),
    descriptionAr: form.descriptionAr.trim() || form.description.trim(),
    images: form.images.filter((url) => url.trim() !== "" && !isDataUrl(url)),
    material: form.material,
    materialAr: form.materialAr.trim(),
    colors: form.colors,
    tag: form.tag,
    tagAr: form.tagAr.trim(),
    pricePerMeter: form.pricePerMeter,
    stockInMeters: form.stockInMeters,
    listedByStore: form.listedByStore.trim(),
    storePickupAddress: {
      emirate: form.pickupAddress.emirate.trim(),
      city: form.pickupAddress.city.trim(),
      street: form.pickupAddress.street?.trim() || "",
      building: form.pickupAddress.building?.trim() || "",
      phone: form.pickupAddress.phone?.trim() || "",
    },
  };

  if (options?.includeIsActive && form.isActive !== undefined) {
    payload.isActive = form.isActive;
  }

  return payload;
}

function isValidObjectId(value: string): boolean {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

export function validateFabricForm(
  form: FabricFormData,
  validation:
    | {
        name_required: string;
        name_ar_required: string;
        description_required: string;
        description_ar_required: string;
        material_required: string;
        color_required: string;
        city_required: string;
        tag_required: string;
        tag_color_required: string;
        price_required: string;
        store_partner_required: string;
        store_partner_invalid: string;
        emirate_required: string;
        pickup_city_required: string;
        images_required: string;
        images_max: string;
        image_upload_pending: string;
      }
    | {
        name_required: string;
        name_ar_required: string;
        description_required: string;
        description_ar_required: string;
        material_required: string;
        color_required: string;
        city_required: string;
        tag_required: string;
        tag_color_required: string;
        price_required: string;
        store_partner_required: string;
        store_partner_invalid: string;
        emirate_required: string;
        pickup_city_required: string;
        images_required: string;
        images_max: string;
        image_upload_pending: string;
      },
): Record<string, string> {
  const errors: Record<string, string> = {};
  // ... required validations ...
  if (!form.material) {
    errors.material = "Material (EN) is required";
  }
  if (!form.materialAr) {
    errors.materialAr = "Material Type (AR) is required";
  }
  if (!form.listedByStore.trim()) {
    errors.listedByStore = "Store partner is required";
  } else if (
    form.listedByStore !== "MOTD" &&
    !isValidObjectId(form.listedByStore)
  ) {
    errors.listedByStore = "Invalid store partner ID";
  }

  const priceVal = Number(form.pricePerMeter);
  const stockVal = Number(form.stockInMeters);

  if (isNaN(priceVal) || priceVal <= 0) {
    errors.pricePerMeter = "Please enter a valid price";
  }
  if (isNaN(stockVal) || stockVal < 0) {
    errors.stockInMeters = "Please enter a valid stock amount";
  }

  // Pickup address validations
  if (!form.pickupAddress.emirate?.trim()) {
    errors["pickupAddress.emirate"] = "Emirate is required";
  }
  if (!form.pickupAddress.city?.trim()) {
    errors["pickupAddress.city"] = "City is required";
  }
  if (!form.pickupAddress.street?.trim()) {
    errors["pickupAddress.street"] = "Street is required";
  }
  if (!form.pickupAddress.building?.trim()) {
    errors["pickupAddress.building"] = "Building is required";
  }
  if (!form.pickupAddress.phone?.trim()) {
    errors["pickupAddress.phone"] = "Phone is required";
  } else if (!/^\d{9}$/.test(form.pickupAddress.phone.trim())) {
    errors["pickupAddress.phone"] = "Phone number must be exactly 9 digits";
  }

  return errors;
}
