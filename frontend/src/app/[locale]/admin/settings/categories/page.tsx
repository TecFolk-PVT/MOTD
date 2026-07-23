"use client";

import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "@/lib/api/client";
import toast from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Palette,
  Shirt,
  Scissors,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ConfirmationModal } from "@/components/shared/ConfirmationModal";

type Domain = "designs" | "fabrics" | "ready-made" | "add-ons";

interface Category {
  _id: string;
  name: string;
  nameAr?: string;
  domain: Domain;
  description?: string;
  descriptionAr?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const DOMAIN_TABS: {
  id: Domain;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { id: "designs", icon: Palette, label: "Designs" },
  { id: "fabrics", icon: Scissors, label: "Fabrics" },
  { id: "ready-made", icon: Shirt, label: "Ready Made" },
  { id: "add-ons", icon: Sparkles, label: "Add Ons" },
];

export default function AdminSettingsCategoriesPage() {
  const [activeDomain, setActiveDomain] = useState<Domain>("designs");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formNameAr, setFormNameAr] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDescriptionAr, setFormDescriptionAr] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await api.get<Category[]>(
        `/api/admin/categories?domain=${activeDomain}`,
      );
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to load categories"));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [activeDomain]);

  const filteredCategories = categories.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.description?.toLowerCase().includes(q)
    );
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormNameAr("");
    setFormDescription("");
    setFormDescriptionAr("");
    setFormIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormNameAr(cat.nameAr || "");
    setFormDescription(cat.description || "");
    setFormDescriptionAr(cat.descriptionAr || "");
    setFormIsActive(cat.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: formName,
      nameAr: formNameAr,
      domain: activeDomain,
      description: formDescription,
      descriptionAr: formDescriptionAr,
      isActive: formIsActive,
    };
    try {
      if (editingCategory) {
        await api.put(`/api/admin/categories/${editingCategory._id}`, payload);
        toast.success("Category updated");
      } else {
        await api.post("/api/admin/categories", payload);
        toast.success("Category created");
      }
      setShowModal(false);
      fetchCategories();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to save category"));
    } finally {
      setSubmitting(false);
    }
  };

  const promptDelete = (id: string) => {
    setCategoryToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeletingId(categoryToDelete);
    setShowDeleteConfirm(false);
    try {
      await api.delete(`/api/admin/categories/${categoryToDelete}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Failed to delete category"));
    } finally {
      setDeletingId(null);
      setCategoryToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setCategoryToDelete(null);
  };

  const formatDate = (d?: string) => {
    if (!d) return "";
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      }).format(new Date(d));
    } catch {
      return d;
    }
  };

  const renderEmptyIcon = () => {
    const tab = DOMAIN_TABS.find((tab) => tab.id === activeDomain);
    const Icon = tab?.icon || Plus;
    return <Icon className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-light text-black tracking-tight">
            Categories
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage categories by domain
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition hover:cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {DOMAIN_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActiveTab = activeDomain === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveDomain(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition hover:cursor-pointer ${
                isActiveTab
                  ? "bg-gray-900 text-white shadow-md"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search categories..."
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500 py-8">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading...
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-gray-100 py-16 shadow-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            {renderEmptyIcon()}
          </div>
          <p className="text-gray-500 max-w-md">No categories found</p>
          <p className="text-gray-400 text-sm mt-1">Add your first category</p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition hover:cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-medium text-black">
                      {cat.name}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        cat.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  {cat.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                      {cat.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-black transition hover:cursor-pointer"
                    aria-label="Edit category"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === cat._id}
                    onClick={() => promptDelete(cat._id)}
                    className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 text-gray-500 hover:text-red-600 transition hover:cursor-pointer disabled:opacity-50"
                    aria-label="Delete category"
                  >
                    {deletingId === cat._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <h2 className="text-xl font-medium text-black mb-6">
                  {editingCategory ? "Edit Category" : "Add Category"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name (Arabic) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formNameAr}
                      onChange={(e) => setFormNameAr(e.target.value)}
                      dir="rtl"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Arabic)
                    </label>
                    <textarea
                      value={formDescriptionAr}
                      onChange={(e) => setFormDescriptionAr(e.target.value)}
                      rows={2}
                      dir="rtl"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Domain
                    </label>
                    <input
                      type="text"
                      value={
                        DOMAIN_TABS.find((d) => d.id === activeDomain)?.label ||
                        ""
                      }
                      readOnly
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-50 text-gray-500 rounded-lg text-sm cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formIsActive}
                      onChange={(e) => setFormIsActive(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700">
                      Active
                    </label>
                  </div>
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition hover:cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 hover:cursor-pointer inline-flex items-center gap-2"
                    >
                      {submitting && (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      )}
                      {submitting ? "Saving..." : "Save"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deletingId !== null}
        isDanger
      />
    </div>
  );
}
