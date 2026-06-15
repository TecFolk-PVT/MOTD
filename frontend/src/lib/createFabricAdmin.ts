// ============================================================
// Constants
// ============================================================

export const FABRIC_MATERIALS = [
  "wool",
  "silk",
  "linen",
  "cashmere",
  "cotton",
] as const;
export type FabricMaterial = (typeof FABRIC_MATERIALS)[number];

export const FABRIC_TAGS = [
  "NEW",
  "BESTSELLER",
  "PREMIUM",
  "ARTISANAL",
  "SALE",
] as const;
export type FabricTag = (typeof FABRIC_TAGS)[number];

export const FABRIC_TAG_COLORS_VALUES = [
  "bg-primary",
  "bg-[#C8A97E]",
  "bg-[#5B4A3A]",
  "bg-gray-500",
  "bg-red-500",
] as const;
export type FabricTagColor = (typeof FABRIC_TAG_COLORS_VALUES)[number];

export const FABRIC_TAG_COLORS_OPTIONS = [
  { value: "bg-primary", label: "Black" },
  { value: "bg-[#C8A97E]", label: "Gold" },
  { value: "bg-[#5B4A3A]", label: "Brown" },
  { value: "bg-gray-500", label: "Gray" },
  { value: "bg-red-500", label: "Red" },
] as const;

// Pickup address shape
export interface PickupAddress {
  emirate: string;
  city: string;
  street?: string;
  building?: string;
  phone?: string;
}

export interface FabricFormData {
  name: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionAr: string;
  images: string[];
  material: FabricMaterial | "";
  color: string;
  city: string;
  tag: FabricTag | "";
  tagColor: FabricTagColor | "";
  pricePerMeter: number;
  listedByStore: string; // store partner ID (ObjectId)
  pickupAddress: PickupAddress;
  isActive: boolean;
}

// ============================================================
// Helper functions
// ============================================================

export function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function isValidObjectId(value: string): boolean {
  return /^[a-f\d]{24}$/i.test(value.trim());
}

export function isDataUrl(value: string): boolean {
  return value.trim().toLowerCase().startsWith("data:");
}

export function hasDataUrlImages(images: string[]): boolean {
  return images.some((url) => url.trim() && isDataUrl(url));
}

export function resolveSlug(
  form: Pick<FabricFormData, "name" | "nameAr" | "slug">,
): string {
  const explicit = form.slug.trim();
  if (explicit) return explicit;

  const fromName = slugFromName(form.name);
  if (fromName) return fromName;

  const fromNameAr = slugFromName(form.nameAr);
  if (fromNameAr) return fromNameAr;

  return `fabric-${Date.now()}`;
}

// ============================================================
// Default / initial form state
// ============================================================

export function defaultFabricForm(): FabricFormData {
  return {
    name: "",
    nameAr: "",
    slug: "",
    description: "",
    descriptionAr: "",
    images: [""],
    material: "",
    color: "",
    city: "",
    tag: "",
    tagColor: "",
    pricePerMeter: 0,
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

// ============================================================
// Convert from API product (GET /api/admin/fabrics or /api/admin/fabrics/:id)
// ============================================================

export function fromApiFabric(
  product: Record<string, unknown>,
): FabricFormData {
  const images =
    Array.isArray(product.images) && product.images.length
      ? (product.images as string[])
      : [""];

  const material =
    typeof product.material === "string" &&
    FABRIC_MATERIALS.includes(product.material as FabricMaterial)
      ? (product.material as FabricMaterial)
      : "";

  const tag =
    typeof product.tag === "string" &&
    FABRIC_TAGS.includes(product.tag as FabricTag)
      ? (product.tag as FabricTag)
      : "";

  let tagColor: FabricTagColor | "" = "";
  const tagColorRaw = product.tagColor;
  if (
    typeof tagColorRaw === "string" &&
    FABRIC_TAG_COLORS_VALUES.includes(tagColorRaw as FabricTagColor)
  ) {
    tagColor = tagColorRaw as FabricTagColor;
  }

  let listedByStore = "";
  if (product.listedByStore) {
    if (
      typeof product.listedByStore === "object" &&
      product.listedByStore !== null &&
      "_id" in product.listedByStore
    ) {
      listedByStore = String((product.listedByStore as { _id: string })._id);
    } else {
      listedByStore = String(product.listedByStore);
    }
  }

  // Extract pickup address from API response (backend sends as object)
  const apiAddress = product.storePickupAddress as
    | Record<string, unknown>
    | undefined;
  const pickupAddress = {
    emirate: typeof apiAddress?.emirate === "string" ? apiAddress.emirate : "",
    city: typeof apiAddress?.city === "string" ? apiAddress.city : "",
    street: typeof apiAddress?.street === "string" ? apiAddress.street : "",
    building:
      typeof apiAddress?.building === "string" ? apiAddress.building : "",
    phone: typeof apiAddress?.phone === "string" ? apiAddress.phone : "",
  };

  return {
    name: typeof product.name === "string" ? product.name : "",
    nameAr: typeof product.nameAr === "string" ? product.nameAr : "",
    slug: typeof product.slug === "string" ? product.slug : "",
    description:
      typeof product.description === "string" ? product.description : "",
    descriptionAr:
      typeof product.descriptionAr === "string" ? product.descriptionAr : "",
    images,
    material,
    color: typeof product.color === "string" ? product.color : "",
    city: typeof product.city === "string" ? product.city : "",
    tag,
    tagColor,
    pricePerMeter:
      typeof product.pricePerMeter === "number" ? product.pricePerMeter : 0,
    listedByStore,
    pickupAddress,
    isActive: typeof product.isActive === "boolean" ? product.isActive : true,
  };
}

// ============================================================
// Convert to API payload (for POST / PUT)
// ============================================================

export function toFabricApiPayload(
  form: FabricFormData,
  options?: { includeIsActive?: boolean },
): Record<string, unknown> {
  const name = form.name.trim();
  const slug = resolveSlug(form);

  const payload: Record<string, unknown> = {
    name,
    nameAr: form.nameAr.trim() || name,
    slug,
    description: form.description.trim(),
    descriptionAr: form.descriptionAr.trim() || form.description.trim(),
    images: form.images.filter((url) => url.trim() !== "" && !isDataUrl(url)),
    material: form.material,
    color: form.color.trim(),
    city: form.city.trim(),
    tag: form.tag,
    tagColor: form.tagColor,
    pricePerMeter: form.pricePerMeter,
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
