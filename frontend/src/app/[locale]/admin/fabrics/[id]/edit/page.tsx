"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api/client";
import FormField from "@/components/admin/FormField";
import FabricImageUpload from "@/components/admin/FabricImageUpload";
import {
  defaultFabricForm,
  fromApiFabric,
  toFabricApiPayload,
  FABRIC_MATERIALS,
  FABRIC_TAGS,
  FABRIC_TAG_COLORS_OPTIONS,
  FabricFormData,
  PickupAddress,
  FabricMaterial,
} from "@/lib/createFabricAdmin";

export default function EditFabricPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FabricFormData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Try direct GET first; fallback to list
        let fabric: any;
        try {
          fabric = await api.get<any>(`/api/admin/fabrics/${id}`);
        } catch (directErr: any) {
          if (directErr.status === 404) {
            const allItems = await api.get<any[]>("/api/admin/fabrics");
            fabric = allItems.find((item) => item._id === id);
            if (!fabric) throw new Error("Fabric not found");
          } else {
            throw directErr;
          }
        }

        // Convert API response to form data using the utility
        const initialForm = fromApiFabric(fabric);
        setFormData(initialForm);
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Failed to load fabric");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (field: keyof FabricFormData, value: any) => {
    if (!formData) return;
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
    if (fieldErrors[field])
      setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handlePickupAddressChange = (
    subfield: keyof PickupAddress,
    value: string,
  ) => {
    if (!formData) return;
    setFormData((prev) => ({
      ...prev!,
      pickupAddress: { ...prev!.pickupAddress, [subfield]: value },
    }));
    const key = `pickupAddress.${subfield}`;
    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleImageChange = (index: number, url: string) => {
    if (!formData) return;
    const newImages = [...formData.images];
    newImages[index] = url;
    handleChange("images", newImages);
  };
  const addImageField = () => {
    if (formData && formData.images.length < 5)
      handleChange("images", [...formData.images, ""]);
  };
  const removeImageField = (index: number) => {
    if (!formData) return;
    const newImages = formData.images.filter((_, i) => i !== index);
    handleChange("images", newImages);
  };

  // Simple ObjectId validation (24 hex characters)
  const isValidObjectId = (id: string): boolean => /^[a-f0-9]{24}$/i.test(id);

  const validate = (): boolean => {
    if (!formData) return false;
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Name (English) is required";
    if (!formData.nameAr.trim()) errors.nameAr = "Name (Arabic) is required";
    if (!formData.description.trim())
      errors.description = "Description (English) is required";
    if (!formData.descriptionAr.trim())
      errors.descriptionAr = "Description (Arabic) is required";
    if (!formData.material) errors.material = "Material is required";
    if (!formData.color.trim()) errors.color = "Color is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.tag) errors.tag = "Tag is required";
    if (!formData.tagColor) errors.tagColor = "Tag color is required";
    if (formData.pricePerMeter <= 0)
      errors.pricePerMeter = "Price per meter must be > 0";
    if (!formData.listedByStore.trim()) {
      errors.listedByStore = "Store partner ID is required";
    } else if (!isValidObjectId(formData.listedByStore.trim())) {
      errors.listedByStore = "Invalid store ID (must be 24 hex characters)";
    }
    if (!formData.pickupAddress.emirate.trim())
      errors["pickupAddress.emirate"] = "Emirate is required";
    if (!formData.pickupAddress.city.trim())
      errors["pickupAddress.city"] = "Pickup city is required";
    if (
      formData.images.length === 0 ||
      formData.images.every((url) => !url?.trim())
    )
      errors.images = "At least one image required";
    if (formData.images.length > 5) errors.images = "Maximum 5 images allowed";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData || !validate()) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = toFabricApiPayload(formData, { includeIsActive: true });
      await api.put(`/api/admin/fabrics/${id}`, payload);
      router.push("/admin/fabrics");
    } catch (err: any) {
      setError(err.message || "Failed to update fabric");
    } finally {
      setSubmitting(false);
    }
  };

  const materialOptions = FABRIC_MATERIALS.map((m) => ({
    value: m,
    label: m.charAt(0).toUpperCase() + m.slice(1),
  }));
  const tagOptions = FABRIC_TAGS.map((tag) => ({ value: tag, label: tag }));
  const tagColorOptions = FABRIC_TAG_COLORS_OPTIONS;

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error && !formData)
    return (
      <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg max-w-md mx-auto">
        <p>{error}</p>
        <button
          onClick={() => router.push("/admin/fabrics")}
          className="mt-4 px-4 py-2 bg-black text-white rounded-lg"
        >
          Back to List
        </button>
      </div>
    );
  if (!formData) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-light text-black tracking-tight">
          Edit Fabric
        </h1>
        <p className="text-gray-500 text-sm mt-1">Update fabric details</p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Name (English)"
            name="name"
            required
            error={fieldErrors.name}
          >
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
              placeholder="e.g., Egyptian Cotton"
            />
          </FormField>
          <FormField
            label="Name (Arabic)"
            name="nameAr"
            required
            error={fieldErrors.nameAr}
          >
            <input
              type="text"
              value={formData.nameAr}
              onChange={(e) => handleChange("nameAr", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
              placeholder="مثال: قطن مصري"
            />
          </FormField>

          <FormField
            label="Description (English)"
            name="description"
            required
            error={fieldErrors.description}
          >
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
              placeholder="Brief description"
            />
          </FormField>
          <FormField
            label="Description (Arabic)"
            name="descriptionAr"
            required
            error={fieldErrors.descriptionAr}
          >
            <textarea
              rows={2}
              value={formData.descriptionAr}
              onChange={(e) => handleChange("descriptionAr", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
              placeholder="وصف مختصر"
            />
          </FormField>

          <FormField
            label="Material"
            name="material"
            required
            error={fieldErrors.material}
          >
            <select
              value={formData.material}
              onChange={(e) =>
                handleChange("material", e.target.value as FabricMaterial)
              }
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
            >
              <option value="">Select material</option>
              {materialOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Color"
            name="color"
            required
            error={fieldErrors.color}
          >
            <input
              type="text"
              value={formData.color}
              onChange={(e) => handleChange("color", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
              placeholder="e.g., White, Cream"
            />
          </FormField>

          <FormField
            label="City (Fabric Location)"
            name="city"
            required
            error={fieldErrors.city}
          >
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
              placeholder="e.g., Dubai"
            />
          </FormField>

          <FormField label="Tag" name="tag" required error={fieldErrors.tag}>
            <select
              value={formData.tag}
              onChange={(e) => handleChange("tag", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
            >
              <option value="">Select a tag</option>
              {tagOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Tag Color"
            name="tagColor"
            required
            error={fieldErrors.tagColor}
          >
            <select
              value={formData.tagColor}
              onChange={(e) => handleChange("tagColor", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
            >
              <option value="">Select tag color</option>
              {tagColorOptions.map((color) => (
                <option key={color.value} value={color.value}>
                  {color.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Price per meter (AED)"
            name="pricePerMeter"
            required
            error={fieldErrors.pricePerMeter}
          >
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.pricePerMeter === 0 ? "" : formData.pricePerMeter}
              onChange={(e) =>
                handleChange(
                  "pricePerMeter",
                  e.target.value === "" ? 0 : parseFloat(e.target.value),
                )
              }
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
              placeholder="0.00"
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField
              label="Fabric Store Partner ID"
              name="listedByStore"
              required
              error={fieldErrors.listedByStore}
            >
              <input
                type="text"
                value={formData.listedByStore}
                onChange={(e) => handleChange("listedByStore", e.target.value)}
                className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                placeholder="24-character MongoDB ObjectId"
              />
            </FormField>
            <p className="text-xs text-gray-400 mt-1">
              Enter a valid store partner ID (e.g.,{" "}
              <code>67a1b2c3d4e5f6a7b8c9d001</code>)
            </p>
          </div>

          {/* Pickup Address (object fields) */}
          <div className="md:col-span-2">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Pickup Address (store location)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="Emirate"
                name="pickupAddress.emirate"
                required
                error={fieldErrors["pickupAddress.emirate"]}
              >
                <input
                  type="text"
                  value={formData.pickupAddress.emirate}
                  onChange={(e) =>
                    handlePickupAddressChange("emirate", e.target.value)
                  }
                  className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                  placeholder="e.g., Dubai"
                />
              </FormField>
              <FormField
                label="City"
                name="pickupAddress.city"
                required
                error={fieldErrors["pickupAddress.city"]}
              >
                <input
                  type="text"
                  value={formData.pickupAddress.city}
                  onChange={(e) =>
                    handlePickupAddressChange("city", e.target.value)
                  }
                  className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                  placeholder="e.g., Downtown"
                />
              </FormField>
              <FormField label="Street (optional)" name="pickupAddress.street">
                <input
                  type="text"
                  value={formData.pickupAddress.street}
                  onChange={(e) =>
                    handlePickupAddressChange("street", e.target.value)
                  }
                  className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                  placeholder="Street name"
                />
              </FormField>
              <FormField
                label="Building (optional)"
                name="pickupAddress.building"
              >
                <input
                  type="text"
                  value={formData.pickupAddress.building}
                  onChange={(e) =>
                    handlePickupAddressChange("building", e.target.value)
                  }
                  className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                  placeholder="Building name/number"
                />
              </FormField>
              <FormField label="Phone (optional)" name="pickupAddress.phone">
                <input
                  type="text"
                  value={formData.pickupAddress.phone}
                  onChange={(e) =>
                    handlePickupAddressChange("phone", e.target.value)
                  }
                  className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                  placeholder="Contact number"
                />
              </FormField>
            </div>
          </div>

          {/* Images section */}
          <div className="md:col-span-2">
            <div className="mb-2 flex justify-between items-center">
              <span className="font-label-sm text-[11px] text-black/60 uppercase tracking-[0.2em]">
                Images (URL or upload) *
              </span>
              {formData.images.length < 5 && (
                <button
                  type="button"
                  onClick={addImageField}
                  className="text-xs text-black underline"
                >
                  + Add another image (max 5)
                </button>
              )}
            </div>
            {formData.images.map((url, idx) => (
              <div key={idx} className="mb-4">
                <FabricImageUpload
                  value={url}
                  onChange={(val) => handleImageChange(idx, val)}
                  error={
                    fieldErrors.images && idx === 0
                      ? fieldErrors.images
                      : undefined
                  }
                />
                {formData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeImageField(idx)}
                    className="text-xs text-red-500 mt-1"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="md:col-span-2">
            <FormField label="Status" name="isActive">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleChange("isActive", e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Active (visible on customer site)
                </label>
              </div>
            </FormField>
          </div>
        </div>

        <div className="flex gap-3 pt-6 mt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
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

