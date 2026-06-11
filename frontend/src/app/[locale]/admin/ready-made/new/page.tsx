"use client";

import { useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";
import { getTranslation } from "@/lib/getTranslation";

interface FormData {
    name: string;
    size: string;
    returnReason: string;
    customOrderId: string;
    price: number;
    description?: string;
    images: string[];
    condition: "like-new" | "excellent" | "good";
}

export default function NewReadyMadePage() {
    const router = useRouter();
    const params = useParams();
    const localeParam = params.locale as string;
    const t = getTranslation(localeParam);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<FormData>({
        name: "",
        size: "",
        returnReason: "",
        customOrderId: "",
        price: 0,
        description: "",
        images: [""],
        condition: "like-new",
    });

    const handleChange = (field: keyof FormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleImageChange = (index: number, url: string) => {
        const newImages = [...formData.images];
        newImages[index] = url;
        handleChange("images", newImages);
    };

    const addImageField = () => {
        if (formData.images.length < 5) {
            handleChange("images", [...formData.images, ""]);
        }
    };

    const removeImageField = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        handleChange("images", newImages);
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = t.adminDashboard.validation.name_required;
        if (!formData.size.trim()) errors.size = t.adminDashboard.validation.size_required;
        if (!formData.returnReason.trim()) errors.returnReason = t.adminDashboard.validation.return_reason_required;
        if (!formData.customOrderId.trim()) errors.customOrderId = t.adminDashboard.validation.custom_order_id_required;
        if (formData.price <= 0) errors.price = t.adminDashboard.validation.price_positive;
        if (formData.images.length === 0 || formData.images.every(url => !url.trim())) {
            errors.images = t.adminDashboard.validation.at_least_one_image;
        }
        if (formData.images.length > 5) {
            errors.images = t.adminDashboard.validation.max_five_images;
        }
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setError(null);
        setLoading(true);
        try {
            const dataToSend = {
                ...formData,
                images: formData.images.filter(url => url.trim() !== ""),
            };
            await api.post('/api/admin/ready-made', dataToSend);
            router.push('/admin/ready-made');
        } catch (err: any) {
            setError(err.message || t.adminDashboard.errors.generic_create_failed);
        } finally {
            setLoading(false);
        }
    };

    console.log("Translation Object: ", t)

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

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label={t.adminDashboard.form.name_label} name="name" required error={fieldErrors.name}>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                            placeholder={t.adminDashboard.form.name_placeholder}
                        />
                    </FormField>

                    <FormField label={t.adminDashboard.form.size_label} name="size" required error={fieldErrors.size}>
                        <input
                            type="text"
                            value={formData.size}
                            onChange={(e) => handleChange('size', e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                            placeholder={t.adminDashboard.form.size_placeholder}
                        />
                    </FormField> 

                    <FormField label={t.adminDashboard.form.return_reason_label} name="returnReason" required error={fieldErrors.returnReason}>
                        <input
                            type="text"
                            value={formData.returnReason}
                            onChange={(e) => handleChange('returnReason', e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                            placeholder={t.adminDashboard.form.return_reason_placeholder}
                        />
                    </FormField>

                    <FormField label={t.adminDashboard.form.custom_order_id_label} name="customOrderId" required error={fieldErrors.customOrderId}>
                        <input
                            type="text"
                            value={formData.customOrderId}
                            onChange={(e) => handleChange('customOrderId', e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                            placeholder={t.adminDashboard.form.custom_order_id_placeholder}
                        />
                    </FormField>

                    <FormField label={t.adminDashboard.form.price_label} name="price" required error={fieldErrors.price}>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price === 0 ? '' : formData.price}
                            onChange={(e) => {
                                const val = e.target.value;
                                handleChange('price', val === '' ? 0 : parseFloat(val));
                            }}
                            onFocus={(e) => e.target.select()}
                            placeholder={t.adminDashboard.form.price_placeholder}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                        />
                    </FormField>

                    <FormField label={t.adminDashboard.form.condition_label} name="condition" required>
                        <select
                            value={formData.condition}
                            onChange={(e) => handleChange('condition', e.target.value as FormData['condition'])}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                        >
                            <option value="like-new">{t.adminDashboard.form.condition_options.like_new}</option>
                            <option value="excellent">{t.adminDashboard.form.condition_options.excellent}</option>
                            <option value="good">{t.adminDashboard.form.condition_options.good}</option>
                        </select>
                    </FormField>

                    <div className="md:col-span-2">
                        <FormField label={t.adminDashboard.form.description_label} name="description">
                            <textarea
                                value={formData.description}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={2}
                                className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                                placeholder={t.adminDashboard.form.description_placeholder}
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
                                    placeholder={t.adminDashboard.form.image_placeholder}
                                    error={fieldErrors.images && idx === 0 ? fieldErrors.images : undefined}
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
                </div>

                <div className="flex gap-3 pt-6 mt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {loading ? t.adminDashboard.form.submit_loading : t.adminDashboard.form.submit_button}
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