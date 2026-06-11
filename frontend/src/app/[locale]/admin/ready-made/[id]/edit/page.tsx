"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api/client";
import FormField from "@/components/admin/FormField";
import ImageUpload from "@/components/admin/ImageUpload";

interface FormData {
    _id: string,
    name: string;
    size: string;
    returnReason: string;
    customOrderId: string;
    price: number;
    description?: string;
    images: string[];
    condition: "like-new" | "excellent" | "good";
    isActive: boolean;
}

export default function EditReadyMadePage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<FormData | null>(null);

    useEffect(() => {
        const fetchItem = async () => {
            try {
                setLoading(true);
                let found: FormData | undefined;

                // Try direct GET by ID first (if endpoint exists)
                try {
                    const direct = await api.get<FormData>(`/api/admin/ready-made/${id}`);
                    found = direct;
                } catch (directErr: any) {
                    // If 404, fallback to list filtering
                    if (directErr.status === 404) {
                        const items = await api.get<FormData[]>('/api/admin/ready-made');
                        found = items.find(item => item._id === id);
                    } else {
                        throw directErr;
                    }
                }

                if (!found) {
                    setError('Item not found');
                    return;
                }

                const defaultData = {
                    name: '',
                    size: '',
                    returnReason: '',
                    customOrderId: '',
                    price: 0,
                    description: '',
                    images: [''],
                    condition: 'like-new' as const,
                    isActive: true,
                };

                setFormData({
                    ...defaultData,
                    ...found,
                    images: found.images?.length ? found.images : [''],
                });
            } catch (err: any) {
                console.error('Fetch failed:', err);
                setError(err.message || 'Failed to load item');
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [id]);

    const handleChange = (field: keyof FormData, value: any) => {
        if (!formData) return;
        setFormData(prev => prev ? { ...prev, [field]: value } : null);
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: "" }));
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
        const newImages = formData.images.filter((_, i) => i !== index);
        handleChange("images", newImages);
    };

    const validate = (): boolean => {
        if (!formData) return false;
        const errors: Record<string, string> = {};

        // Use optional chaining and fallback to empty string
        if (!formData.name?.trim()) errors.name = "Product name is required";
        if (!formData.size?.trim()) errors.size = "Size is required";
        if (!formData.returnReason?.trim()) errors.returnReason = "Return reason is required";
        if (!formData.customOrderId?.trim()) errors.customOrderId = "Custom order ID is required";
        if (formData.price === undefined || formData.price <= 0) errors.price = "Price must be greater than 0";
        if (!formData.images?.length || formData.images.every(url => !url?.trim()))
            errors.images = "At least one image is required";
        if (formData.images?.length > 5) errors.images = "Maximum 5 images allowed";

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!formData || !validate()) return;
        setSubmitting(true);
        setError(null);
        try {
            const dataToSend = {
                ...formData,
                images: formData.images.filter(url => url.trim() !== ""),
            };
            await api.put(`/api/admin/ready-made/${id}`, dataToSend);
            router.push('/admin/ready-made');
        } catch (err: any) {
            setError(err.message || 'Failed to update item');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;
    if (error && !formData) return <div className="text-red-600 p-6">{error}</div>;
    if (!formData) return null;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl md:text-3xl font-light text-black tracking-tight">Edit Ready Made Item</h1>
                <p className="text-gray-500 text-sm mt-1">Update details of the size‑return garment</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Product Name" name="name" required error={fieldErrors.name}>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                        />
                    </FormField>

                    <FormField label="Size" name="size" required error={fieldErrors.size}>
                        <input
                            type="text"
                            value={formData.size}
                            onChange={(e) => handleChange('size', e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                        />
                    </FormField>

                    <FormField label="Return Reason" name="returnReason" required error={fieldErrors.returnReason}>
                        <input
                            type="text"
                            value={formData.returnReason}
                            onChange={(e) => handleChange('returnReason', e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                        />
                    </FormField>

                    <FormField label="Linked Custom Order ID" name="customOrderId" required error={fieldErrors.customOrderId}>
                        <input
                            type="text"
                            value={formData.customOrderId}
                            onChange={(e) => handleChange('customOrderId', e.target.value)}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                        />
                    </FormField>

                    <FormField label="Price (AED)" name="price" required error={fieldErrors.price}>
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
                            placeholder="0.00"
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                        />
                    </FormField>

                    <FormField label="Condition" name="condition" required>
                        <select
                            value={formData.condition}
                            onChange={(e) => handleChange('condition', e.target.value as FormData['condition'])}
                            className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                        >
                            <option value="like-new">Like New</option>
                            <option value="excellent">Excellent</option>
                            <option value="good">Good</option>
                        </select>
                    </FormField>

                    <div className="md:col-span-2">
                        <FormField label="Description (optional)" name="description">
                            <textarea
                                value={formData.description || ""}
                                onChange={(e) => handleChange('description', e.target.value)}
                                rows={2}
                                className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none"
                            />
                        </FormField>
                    </div>

                    <div className="md:col-span-2">
                        <div className="mb-2 flex justify-between items-center">
                            <span className="font-label-sm text-[11px] md:text-[12px] text-black/60 uppercase tracking-[0.2em]">
                                Images (Upload or URL) *
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
                                <ImageUpload
                                    value={url}
                                    onChange={(val) => handleImageChange(idx, val)}
                                    placeholder="Image URL or upload file"
                                    error={fieldErrors.images && idx === 0 ? fieldErrors.images : undefined}
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
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
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
                        {submitting ? 'Saving...' : 'Save Changes'}
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