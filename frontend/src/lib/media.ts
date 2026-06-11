const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/** Turn stored upload paths into full URLs served by the API. */
export function resolveMediaUrl(path: string | undefined): string {
    if (!path) return "";

    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("data:")
    ) {
        return path;
    }

    if (path.startsWith("/uploads/")) {
        return `${API_BASE}${path}`;
    }

    return path;
}
