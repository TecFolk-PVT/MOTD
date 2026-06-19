"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api/client";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import { getTranslation } from "@/lib/getTranslation";
import {
  defaultReadyMadeForm,
  fromApiProduct,
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

// Sanitize name fields
const sanitizeName = (value: string) =>
  value.replace(/[^a-zA-Z\u0600-\u06FF\s\-']/g, "");

export default function EditReadyMadePage() {
  const router = useRouter();
  const params = useParams();
  const localeParam = params.locale as string;
  const id = params.id as string;
  const t = getTranslation(localeParam);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<ReadyMadeFormData | null>(null);
  const [fabricWidth, setFabricWidth] = useState<"single" | "double">("single");

  // Fetch item
  useEffect(() => {
    const fetchItem = async () => {
      try {
        setLoading(true);
        let found: Record<string, unknown> | undefined;

        try {
          found = await api.get<Record<string, unknown>>(
            `/api/admin/ready-made/${id}`,
          );
        } catch (directErr: unknown) {
          const status =
            directErr && typeof directErr === "object" && "status" in directErr
              ? (directErr as { status: number }).status
              : undefined;

          if (status === 404) {
            const items = await api.get<Record<string, unknown>[]>(
              "/api/admin/ready-made",
            );
            found = items.find((item) => item._id === id);
          } else {
            throw directErr;
          }
        }

        if (!found) {
          setError("Product not found");
          return;
        }

        const data = fromApiProduct(found);
        setFormData(data);

        if (found.fabricWidth) {
          setFabricWidth(found.fabricWidth as "single" | "double");
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load product";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [id]);

  // Handlers
  const handleChange = (field: keyof ReadyMadeFormData, value: unknown) => {
    if (!formData) return;
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    }
    // Clear success/error when user makes a change
    setSuccess(null);
    setError(null);
  };

  const handleNameChange = (
    field: "name" | "nameAr" | "tailorName" | "tailorNameAr",
    value: string,
  ) => {
    const sanitized = sanitizeName(value);
    handleChange(field, sanitized);
  };

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

  const getNumberDisplay = (value: number): string => {
    return value === 0 ? "" : String(value);
  };

  // Image handlers
  const addImage = () => {
    if (!formData) return;
    if (formData.images.length < 5) {
      handleChange("images", [...formData.images, ""]);
    }
  };

  const removeImage = (index: number) => {
    if (!formData) return;
    const newImages = formData.images.filter((_, i) => i !== index);
    handleChange("images", newImages);
  };

  const handleImageChange = (index: number, url: string) => {
    if (!formData) return;
    const newImages = [...formData.images];
    newImages[index] = url;
    handleChange("images", newImages);
  };

  const toggleColor = (colorValue: string) => {
    if (!formData) return;
    const current = formData.colors;
    const index = current.indexOf(colorValue);
    const updated =
      index === -1
        ? [...current, colorValue]
        : current.filter((c) => c !== colorValue);
    handleChange("colors", updated);
  };

  // Validation
  const validate = (): boolean => {
    if (!formData) return false;
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

  // Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData || !validate()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const firstImage = formData.images.find((img) => img.trim() !== "") || "";
    const payload = toApiPayload({
      ...formData,
      thumbnailImage: firstImage,
    });
    (payload as any).fabricWidth = fabricWidth;

    try {
      await api.put(`/api/admin/ready-made/${id}`, payload);
      setSuccess("Product updated successfully!");
      // Optionally redirect after a short delay
      setTimeout(() => {
        router.push("/admin/ready-made");
      }, 2000);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to update product"));
    } finally {
      setSubmitting(false);
    }
  };

  // Loading / error states
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-10 text-center">
        <div className="w-12 h-12 border-2 border-black/20 border-t-black rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading product...</p>
      </div>
    );
  }

  if (error && !formData) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-light text-black tracking-tight">
          Edit Ready-Made Product
        </h1>
        <p className="text-gray-500 text-sm mt-1">Update the product details</p>
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
          <div className="md:col-span-2">
            <FormField label="Description">
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
              />
            </FormField>
          </div>

          {/* DESCRIPTION (AR) */}
          <div className="md:col-span-2">
            <FormField label="Description (AR)">
              <textarea
                rows={2}
                value={formData.descriptionAr}
                onChange={(e) => handleChange("descriptionAr", e.target.value)}
                className="w-full py-1 border-b border-gray-300 focus:border-black outline-none"
              />
            </FormField>
          </div>

          {/* CODE */}
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

          {/* FABRIC WIDTH */}
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

          {/* TAG COLOR */}
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

          {/* COLORS – checkboxes */}
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

          {/* IMAGES */}
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

          {/* IS ACTIVE */}
          <div className="md:col-span-2">
            <FormField label="Active Status" name="isActive">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Product is active (visible to customers)
                </label>
              </div>
            </FormField>
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
            disabled={submitting}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Update Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
