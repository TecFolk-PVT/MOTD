"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api/client";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import { getTranslation } from "@/lib/getTranslation";
import {
  defaultReadyMadeForm,
  toApiPayload,
  type ReadyMadeFormData,
} from "@/lib/readyMadeAdmin";

// Predefined tag and color options
const TAG_OPTIONS = [
  { value: "new", en: "New", ar: "جديد" },
  { value: "bestseller", en: "Bestseller", ar: "الأكثر مبيعاً" },
  { value: "premium", en: "Premium", ar: "ممتاز" },
  { value: "limited", en: "Limited", ar: "محدود" },
  { value: "custom", en: "Custom", ar: "مخصص" },
];

const COLOR_OPTIONS = [
  { value: "red", en: "Red", ar: "أحمر" },
  { value: "blue", en: "Blue", ar: "أزرق" },
  { value: "green", en: "Green", ar: "أخضر" },
  { value: "black", en: "Black", ar: "أسود" },
  { value: "white", en: "White", ar: "أبيض" },
  { value: "gold", en: "Gold", ar: "ذهبي" },
  { value: "silver", en: "Silver", ar: "فضي" },
];

// Helper: sanitize name fields (allow letters, spaces, hyphens, apostrophes)
const sanitizeName = (value: string) =>
  value.replace(/[^a-zA-Z\u0600-\u06FF\s\-']/g, "");

export default function NewReadyMadePage() {
  const router = useRouter();
  const params = useParams();
  const localeParam = params.locale as string;
  const t = getTranslation(localeParam);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ReadyMadeFormData>(
    defaultReadyMadeForm(),
  );
  const [fabricWidth, setFabricWidth] = useState<"single" | "double">("single");

  const handleChange = (field: keyof ReadyMadeFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear messages when user changes any field
    setError(null);
    setSuccess(null);
  };

  // Sanitized handlers for name fields
  const handleNameChange = (
    field: "name" | "nameAr" | "tailorName" | "tailorNameAr",
    value: string,
  ) => {
    const sanitized = sanitizeName(value);
    handleChange(field, sanitized);
  };

  // Number handler – allows empty (shows as empty), sets to 0 when empty, else parse non‑negative
  const handleNumberChange = (
    field: keyof ReadyMadeFormData,
    value: string,
  ) => {
    if (value === "") {
      handleChange(field, 0);
    } else {
      const num = Number(value);
      if (!isNaN(num) && num >= 0) {
        handleChange(field, num);
      }
    }
  };

  // Helper to get display value (empty when 0)
  const getNumberDisplay = (value: number): string => {
    return value === 0 ? "" : String(value);
  };

  // Image handlers – max 5, initially one field
  const addImage = () => {
    if (formData.images.length < 5) {
      handleChange("images", [...formData.images, ""]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    handleChange("images", newImages);
  };

  const handleImageChange = (index: number, url: string) => {
    const newImages = [...formData.images];
    newImages[index] = url;
    handleChange("images", newImages);
  };

  // Color checkboxes – toggle
  const toggleColor = (colorValue: string) => {
    const current = formData.colors;
    const index = current.indexOf(colorValue);
    const updated =
      index === -1
        ? [...current, colorValue]
        : current.filter((c) => c !== colorValue);
    handleChange("colors", updated);
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Name required";
    if (!formData.fabricType.trim()) errors.fabricType = "Fabric type required";
    if (!formData.tailorName.trim()) errors.tailorName = "Tailor required";

    const hasImage = formData.images.some((img) => img.trim() !== "");
    if (!hasImage) errors.images = "At least one image is required";

    if (formData.metersPerFabric <= 0)
      errors.metersPerFabric = "Meters must be greater than 0";
    if (formData.fabricPriceAED < 0)
      errors.fabricPriceAED = "Price cannot be negative";
    if (formData.mukhawarPriceAED < 0)
      errors.mukhawarPriceAED = "Price cannot be negative";
    if (formData.finalSellingPriceAED < 0)
      errors.finalSellingPriceAED = "Price cannot be negative";
    if (formData.availableFabricStock < 0)
      errors.availableFabricStock = "Stock cannot be negative";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setError(null);
    setSuccess(null);
    setLoading(true);

    // Prepare payload: set thumbnailImage as first image (if any)
    const firstImage = formData.images.find((img) => img.trim() !== "") || "";
    const payload = toApiPayload({
      ...formData,
      thumbnailImage: firstImage,
    });
    (payload as any).fabricWidth = fabricWidth;

    try {
      await api.post("/api/admin/ready-made", payload);
      setSuccess("Product created successfully!");
      // Optionally redirect after a short delay
      setTimeout(() => {
        router.push("/admin/ready-made");
      }, 3000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to create product"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-light text-black tracking-tight">
          {t.adminDashboard.title}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {t.adminDashboard.subtitle}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* NAME */}
          <FormField
            label="Name (ENG)"
            name="name"
            required
            error={fieldErrors.name}
          >
            <input
              value={formData.name}
              onChange={(e) => handleNameChange("name", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* NAME AR */}
          <FormField label="Name (AR)" name="nameAr">
            <input
              value={formData.nameAr}
              onChange={(e) => handleNameChange("nameAr", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* DESCRIPTION (EN) */}
          <FormField label="Description">
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* DESCRIPTION (AR) */}
          <FormField label="Description (AR)">
            <textarea
              rows={2}
              value={formData.descriptionAr}
              onChange={(e) => handleChange("descriptionAr", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* CODE (optional) */}
          <FormField label="Code (OPTIONAL)" name="code">
            <input
              value={formData.code}
              onChange={(e) => handleChange("code", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* STOCK */}
          <FormField
            label="Available Stock"
            error={fieldErrors.availableFabricStock}
          >
            <input
              type="number"
              min="0"
              step="1"
              value={getNumberDisplay(formData.availableFabricStock)}
              onChange={(e) =>
                handleNumberChange("availableFabricStock", e.target.value)
              }
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* FABRIC TYPE */}
          <FormField label="Fabric Type (ENG)" name="fabricType" required>
            <input
              value={formData.fabricType}
              onChange={(e) => handleChange("fabricType", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* FABRIC TYPE AR */}
          <FormField label="Fabric Type (AR)" name="fabricTypeAr">
            <input
              value={formData.fabricTypeAr}
              onChange={(e) => handleChange("fabricTypeAr", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* TAILOR NAME */}
          <FormField label="Tailor Name (ENG)" name="tailorName" required>
            <input
              value={formData.tailorName}
              onChange={(e) => handleNameChange("tailorName", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* TAILOR NAME AR */}
          <FormField label="Tailor Name (AR)" name="tailorNameAr">
            <input
              value={formData.tailorNameAr}
              onChange={(e) => handleNameChange("tailorNameAr", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* METERS */}
          <FormField
            label="Fabric length (in meters)"
            error={fieldErrors.metersPerFabric}
          >
            <input
              type="number"
              min="0"
              step="0.1"
              value={getNumberDisplay(formData.metersPerFabric)}
              onChange={(e) => {
                if (e.target.value === "") {
                  handleChange("metersPerFabric", 0);
                } else {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    handleChange("metersPerFabric", val);
                  }
                }
              }}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* FABRIC WIDTH – radio buttons */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Fabric Width
            </label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="fabricWidth"
                  value="single"
                  checked={fabricWidth === "single"}
                  onChange={() => setFabricWidth("single")}
                  className="accent-black"
                />
                Single Width
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="fabricWidth"
                  value="double"
                  checked={fabricWidth === "double"}
                  onChange={() => setFabricWidth("double")}
                  className="accent-black"
                />
                Double Width
              </label>
            </div>
          </div>

          {/* PRICES */}
          <FormField
            label="Fabric Price AED"
            error={fieldErrors.fabricPriceAED}
          >
            <input
              type="number"
              min="0"
              step="0.01"
              value={getNumberDisplay(formData.fabricPriceAED)}
              onChange={(e) =>
                handleNumberChange("fabricPriceAED", e.target.value)
              }
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          <FormField
            label="Mukhawar Price AED"
            error={fieldErrors.mukhawarPriceAED}
          >
            <input
              type="number"
              min="0"
              step="0.01"
              value={getNumberDisplay(formData.mukhawarPriceAED)}
              onChange={(e) =>
                handleNumberChange("mukhawarPriceAED", e.target.value)
              }
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          <FormField
            label="Final Selling Price AED"
            error={fieldErrors.finalSellingPriceAED}
          >
            <input
              type="number"
              min="0"
              step="0.01"
              value={getNumberDisplay(formData.finalSellingPriceAED)}
              onChange={(e) =>
                handleNumberChange("finalSellingPriceAED", e.target.value)
              }
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            />
          </FormField>

          {/* TAG dropdowns */}
          <FormField label="Tag (EN)" name="tag">
            <select
              value={formData.tag}
              onChange={(e) => handleChange("tag", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            >
              <option value="">Select tag</option>
              {TAG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.en}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tag (AR)" name="tagAr">
            <select
              value={formData.tagAr}
              onChange={(e) => handleChange("tagAr", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            >
              <option value="">اختر الوسم</option>
              {TAG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.ar}
                </option>
              ))}
            </select>
          </FormField>

          {/* TAG COLOR dropdowns */}
          <FormField label="Tag Color (EN)" name="tagColor">
            <select
              value={formData.tagColor}
              onChange={(e) => handleChange("tagColor", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
            >
              <option value="">Select color</option>
              {COLOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.en}
                </option>
              ))}
            </select>
          </FormField>

          {/* COLORS – multi‑select checkboxes */}
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-2">
              Colors (select multiple)
            </label>
            <div className="flex flex-wrap gap-4">
              {COLOR_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.colors.includes(opt.value)}
                    onChange={() => toggleColor(opt.value)}
                    className="accent-black"
                  />
                  {opt.en} / {opt.ar}
                </label>
              ))}
            </div>
          </div>

          {/* IMAGES – starts with one field, max 5 */}
          <div className="md:col-span-2">
            <div className="mb-2 text-xs uppercase tracking-widest text-gray-500">
              Images (max 5) *
            </div>
            {fieldErrors.images && (
              <p className="text-red-500 text-sm mb-2">{fieldErrors.images}</p>
            )}

            {formData.images.map((img, idx) => (
              <div key={idx} className="mb-3">
                <ImageUpload
                  value={img}
                  onChange={(val) => handleImageChange(idx, val)}
                  chooseFileLabel={`Upload Image ${idx + 1}`}
                  uploadingLabel="Uploading..."
                  uploadFailedLabel="Failed"
                  removeLabel="Remove"
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="text-xs text-red-500 mt-1"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            {formData.images.length < 5 && (
              <button
                type="button"
                onClick={addImage}
                className="text-xs underline"
              >
                + Add Image
              </button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mt-2">
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-2">
            {error}
          </div>
        )}

        {/* SUBMIT */}
        <div className="flex gap-3 pt-6 mt-3 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-black text-white rounded-lg"
          >
            {loading ? "Saving..." : "Create Product"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
