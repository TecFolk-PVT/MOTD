"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api/client";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import { getTranslation } from "@/lib/getTranslation";
import {
    READY_MADE_STYLES,
    fromApiProduct,
    isValidObjectId,
    toApiPayload,
    type ReadyMadeFormData,
} from "@/lib/readyMadeAdmin";

export default function EditReadyMadePage() {
    const router = useRouter();
    const params = useParams();
    const localeParam = params.locale as string;
    const id = params.id as string;
    const t = getTranslation(localeParam);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<ReadyMadeFormData | null>(null);

    useEffect(() => {
        const labels = getTranslation(localeParam);

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
                        directErr &&
                        typeof directErr === "object" &&
                        "status" in directErr
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
                    setError(labels.editReadyMade.form.not_found);
                    return;
                }

                setFormData(fromApiProduct(found));
            } catch (err: unknown) {
                const message =
                    err instanceof Error
                        ? err.message
                        : labels.editReadyMade.errors.generic_load_failed;
                setError(message);
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id, localeParam]);

    const handleChange = (field: keyof ReadyMadeFormData, value: unknown) => {
        if (!formData) return;
        setFormData((prev) => (prev ? { ...prev, [field]: value } : null));
        if (fieldErrors[field]) {
            setFieldErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleImageChange = (index: number, url: string) => {
        if (!formData) return;
        const newImages = [...formData.images];
        newImages[index] = url;
        handleChange("images", newImages);
    };

    const addImageField = () => {
        if (!formData) return;
        if (formData.images.length < 5) {
            handleChange("images", [...formData.images, ""]);
        }
    };

    const removeImageField = (index: number) => {
        if (!formData) return;
        handleChange(
            "images",
            formData.images.filter((_, i) => i !== index),
        );
    };

    const validate = (): boolean => {
        if (!formData) return false;
        const errors: Record<string, string> = {};

        if (!formData.name?.trim()) errors.name = t.adminDashboard.validation.name_required;
        if (!formData.style) errors.style = t.adminDashboard.validation.style_required;
        if (!formData.size?.trim()) errors.size = t.adminDashboard.validation.size_required;
        if (!formData.customOrderId?.trim()) {
            errors.customOrderId = t.adminDashboard.validation.custom_order_id_required;
        } else if (!isValidObjectId(formData.customOrderId)) {
            errors.customOrderId = t.adminDashboard.validation.custom_order_id_invalid;
        }
        if (formData.price === undefined || formData.price <= 0) {
            errors.price = t.adminDashboard.validation.price_positive;
        }
        if (!formData.images?.length || formData.images.every((url) => !url?.trim())) {
            errors.images = t.adminDashboard.validation.at_least_one_image;
        }
        if (formData.images?.length > 5) {
            errors.images = t.adminDashboard.validation.max_five_images;
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData || !validate()) return;
        setSubmitting(true);
        setError(null);
        try {
            await api.put(
                `/api/admin/ready-made/${id}`,
                toApiPayload(formData, { includeIsActive: true }),
            );
            router.push("/admin/ready-made");
        } catch (err: unknown) {
            setError(
                getApiErrorMessage(err, t.editReadyMade.errors.generic_update_failed),
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center py-10">{t.editReadyMade.form.loading}</div>;
    }
    if (error && !formData) {
        return <div className="text-red-600 p-6">{error}</div>;
    }
    if (!formData) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-light text-black tracking-tight">
                    {t.editReadyMade.title}
                </h1>
                <p className="text-gray-500 text-sm mt-1">{t.editReadyMade.subtitle}</p>
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
                        label={t.adminDashboard.form.name_label}
                        name="name"
                        required
                        error={fieldErrors.name}
                    >
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                            placeholder={t.adminDashboard.form.name_placeholder}
                        />
                    </FormField>

                    <FormField
                        label={t.adminDashboard.form.name_ar_label}
                        name="nameAr"
                        error={fieldErrors.nameAr}
                    >
                        <input
                            type="text"
                            value={formData.nameAr}
                            onChange={(e) => handleChange("nameAr", e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                            placeholder={t.adminDashboard.form.name_ar_placeholder}
                        />
                    </FormField>

                    <FormField
                        label={t.adminDashboard.form.style_label}
                        name="style"
                        required
                        error={fieldErrors.style}
                    >
                        <select
                            value={formData.style}
                            onChange={(e) => handleChange("style", e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                        >
                            <option value="">{t.adminDashboard.form.style_placeholder}</option>
                            {READY_MADE_STYLES.map((style) => (
                                <option key={style} value={style}>
                                    {t.adminDashboard.form.style_options[style]}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField
                        label={t.adminDashboard.form.size_label}
                        name="size"
                        required
                        error={fieldErrors.size}
                    >
                        <input
                            type="text"
                            value={formData.size}
                            onChange={(e) => handleChange("size", e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                            placeholder={t.adminDashboard.form.size_placeholder}
                        />
                    </FormField>

                    <FormField
                        label={t.adminDashboard.form.return_reason_label}
                        name="returnReason"
                    >
                        <input
                            type="text"
                            value={t.adminDashboard.form.return_reason_fixed}
                            readOnly
                            className="w-full py-1 border-b border-gray-200 bg-gray-50 text-gray-600 focus:outline-none"
                        />
                    </FormField>

                    <FormField
                        label={t.adminDashboard.form.custom_order_id_label}
                        name="customOrderId"
                        required
                        error={fieldErrors.customOrderId}
                    >
                        <input
                            type="text"
                            value={formData.customOrderId}
                            onChange={(e) => handleChange("customOrderId", e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                            placeholder={t.adminDashboard.form.custom_order_id_placeholder}
                        />
                    </FormField>

                    <FormField
                        label={t.adminDashboard.form.price_label}
                        name="price"
                        required
                        error={fieldErrors.price}
                    >
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price === 0 ? "" : formData.price}
                            onChange={(e) => {
                                const val = e.target.value;
                                handleChange("price", val === "" ? 0 : parseFloat(val));
                            }}
                            onFocus={(e) => e.target.select()}
                            placeholder={t.adminDashboard.form.price_placeholder}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                        />
                    </FormField>

                    <FormField label={t.adminDashboard.form.condition_label} name="condition" required>
                        <select
                            value={formData.condition}
                            onChange={(e) =>
                                handleChange(
                                    "condition",
                                    e.target.value as ReadyMadeFormData["condition"],
                                )
                            }
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                        >
                            <option value="like_new">
                                {t.adminDashboard.form.condition_options.like_new}
                            </option>
                            <option value="excellent">
                                {t.adminDashboard.form.condition_options.excellent}
                            </option>
                            <option value="good">{t.adminDashboard.form.condition_options.good}</option>
                        </select>
                    </FormField>

                    <div className="md:col-span-2">
                        <FormField
                            label={t.adminDashboard.form.description_label}
                            name="description"
                        >
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                rows={2}
                                className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                                placeholder={t.adminDashboard.form.description_placeholder}
                            />
                        </FormField>
                    </div>

                    <div className="md:col-span-2">
                        <FormField
                            label={t.adminDashboard.form.description_ar_label}
                            name="descriptionAr"
                        >
                            <textarea
                                value={formData.descriptionAr}
                                onChange={(e) => handleChange("descriptionAr", e.target.value)}
                                rows={2}
                                className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                                placeholder={t.adminDashboard.form.description_ar_placeholder}
                            />
                        </FormField>
                    </div>

                    <div className="md:col-span-2">
                        <div className="mb-2 flex justify-between items-center">
                            <span className="font-label-sm text-[11px] md:text-[12px] text-black/60 uppercase tracking-[0.2em]">
                                {t.adminDashboard.form.images_label} *
                            </span>
                            {formData.images.length < 5 && (
                                <button
                                    type="button"
                                    onClick={addImageField}
                                    className="text-xs text-black underline"
                                >
                                    {t.adminDashboard.form.add_image_button}
                                </button>
                            )}
                        </div>
                        {formData.images.map((url, idx) => (
                            <div key={idx} className="mb-4">
                                <ImageUpload
                                    value={url}
                                    onChange={(val) => handleImageChange(idx, val)}
                                    chooseFileLabel={t.adminDashboard.form.upload_image_button}
                                    uploadingLabel={t.adminDashboard.form.uploading_image}
                                    uploadFailedLabel={t.adminDashboard.form.upload_failed}
                                    removeLabel={t.adminDashboard.form.remove_image_button}
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
                                        {t.adminDashboard.form.remove_image_button}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="md:col-span-2">
                        <FormField label={t.editReadyMade.form.status_label} name="isActive">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange("isActive", e.target.checked)}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700">
                                    {t.editReadyMade.form.status_active}
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
                        {submitting
                            ? t.editReadyMade.form.submit_loading
                            : t.editReadyMade.form.submit_button}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    >
                        {t.adminDashboard.form.cancel_button}
                    </button>
                </div>
            </form>
        </div>
    );
}
