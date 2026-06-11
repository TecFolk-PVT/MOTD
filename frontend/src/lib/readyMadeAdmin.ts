export const READY_MADE_STYLES = [
    "kandura",
    "abaya",
    "bisht",
    "mukhawar",
    "jalabiya",
    "kaftan",
] as const;

export type ReadyMadeStyle = (typeof READY_MADE_STYLES)[number];
export type ReadyMadeCondition = "like_new" | "excellent" | "good";

export interface ReadyMadeFormData {
    name: string;
    nameAr: string;
    slug: string;
    size: string;
    style: ReadyMadeStyle | "";
    returnReason: string;
    customOrderId: string;
    price: number;
    description: string;
    descriptionAr: string;
    images: string[];
    condition: ReadyMadeCondition;
    isActive?: boolean;
}

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

export function resolveSlug(form: Pick<ReadyMadeFormData, "name" | "nameAr" | "slug">): string {
    const explicit = form.slug.trim();
    if (explicit) return explicit;

    const fromName = slugFromName(form.name);
    if (fromName) return fromName;

    const fromNameAr = slugFromName(form.nameAr);
    if (fromNameAr) return fromNameAr;

    return `ready-made-${Date.now()}`;
}

export function defaultReadyMadeForm(): ReadyMadeFormData {
    return {
        name: "",
        nameAr: "",
        slug: "",
        size: "",
        style: "",
        returnReason: "size_issue",
        customOrderId: "",
        price: 0,
        description: "",
        descriptionAr: "",
        images: [""],
        condition: "like_new",
        isActive: true,
    };
}

export function fromApiProduct(product: Record<string, unknown>): ReadyMadeFormData {
    const sourceId = product.sourceCustomOrderId;
    let customOrderId = "";

    if (sourceId && typeof sourceId === "object" && sourceId !== null && "_id" in sourceId) {
        customOrderId = String((sourceId as { _id: string })._id);
    } else if (sourceId) {
        customOrderId = String(sourceId);
    }

    const images = Array.isArray(product.images) && product.images.length
        ? (product.images as string[])
        : [""];

    const style = typeof product.style === "string" ? product.style : "";
    const condition =
        product.condition === "like_new" ||
        product.condition === "excellent" ||
        product.condition === "good"
            ? product.condition
            : "like_new";

    return {
        name: typeof product.name === "string" ? product.name : "",
        nameAr: typeof product.nameAr === "string" ? product.nameAr : "",
        slug: typeof product.slug === "string" ? product.slug : "",
        size: typeof product.size === "string" ? product.size : "",
        style: READY_MADE_STYLES.includes(style as ReadyMadeStyle)
            ? (style as ReadyMadeStyle)
            : "",
        returnReason: typeof product.returnReason === "string" ? product.returnReason : "",
        customOrderId,
        price: typeof product.price === "number" ? product.price : 0,
        description: typeof product.description === "string" ? product.description : "",
        descriptionAr: typeof product.descriptionAr === "string" ? product.descriptionAr : "",
        images,
        condition,
        isActive: typeof product.isActive === "boolean" ? product.isActive : true,
    };
}

export function toApiPayload(
    form: ReadyMadeFormData,
    options?: { includeIsActive?: boolean },
): Record<string, unknown> {
    const name = form.name.trim();
    const customOrderId = form.customOrderId.trim();

    const payload: Record<string, unknown> = {
        name,
        nameAr: form.nameAr.trim() || name,
        slug: resolveSlug(form),
        size: form.size.trim(),
        style: form.style,
        returnReason: "size_issue",
        ...(customOrderId ? { sourceCustomOrderId: customOrderId } : {}),
        price: form.price,
        description: form.description.trim(),
        descriptionAr: form.descriptionAr.trim(),
        images: form.images.filter((url) => url.trim() !== "" && !isDataUrl(url)),
        condition: form.condition,
    };

    if (options?.includeIsActive && form.isActive !== undefined) {
        payload.isActive = form.isActive;
    }

    return payload;
}
