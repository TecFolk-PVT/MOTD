"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import FormField from "@/components/admin/FormField";
import FabricImageUpload from "@/components/admin/FabricImageUpload";
import StorePartnerPicker from "@/components/admin/StorePartnerPicker";
import AnimatedDropdown from "@/components/shared/AnimatedDropdown";
import colors from "@/components/shared/colors";
import {
  FABRIC_MATERIALS,
  FabricFormData,
  FabricMaterialValue,
  FABRIC_TAGS,
  PickupAddress,
  UAE_EMIRATES,
} from "@/lib/createFabricAdmin";
import { FabricUnitValue, WARA_TO_METERS } from "@/lib/fabrics";
import { api } from "@/lib/api/client";

const COLOR_OPTIONS = colors;

type FabricAdminFormFieldsProps = {
  formData: FabricFormData;
  fieldErrors: Record<string, string>;
  onFieldChange: (field: keyof FabricFormData, value: unknown) => void;
  onPickupChange: (subfield: keyof PickupAddress, value: string) => void;
  onImageChange: (index: number, url: string) => void;
  onAddImage: () => void;
  onRemoveImage: (index: number) => void;
};

export default function FabricAdminFormFields({
  formData,
  fieldErrors,
  onFieldChange,
  onPickupChange,
  onImageChange,
  onAddImage,
  onRemoveImage,
}: FabricAdminFormFieldsProps) {
  const [openVariantColorDropdown, setOpenVariantColorDropdown] = useState<
    number | null
  >(null);
  const [dbMaterials, setDbMaterials] = useState<
    { name: string; nameAr: string; _id: string }[]
  >([]);
  const [materialsLoading, setMaterialsLoading] = useState(true);
  const [dbTags, setDbTags] = useState<
    { name: string; nameAr: string; _id: string }[]
  >([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Dropdown states for AnimatedDropdown
  const [openMaterialEn, setOpenMaterialEn] = useState(false);
  const [openMaterialAr, setOpenMaterialAr] = useState(false);
  const [openTagEn, setOpenTagEn] = useState(false);
  const [openTagAr, setOpenTagAr] = useState(false);
  const [openEmirate, setOpenEmirate] = useState(false);
  const [openUnit, setOpenUnit] = useState(false);
  const [openColors, setOpenColors] = useState(false);

  // Fetch materials from DB
  useEffect(() => {
    let cancelled = false;
    const fetchMaterials = async () => {
      try {
        setMaterialsLoading(true);
        const data = await api.get<
          { name: string; nameAr: string; _id: string }[]
        >("/api/filters/materials");
        if (!cancelled) {
          setDbMaterials(Array.isArray(data) ? data : []);
        }
      } catch {
        // Silently fall back to FABRIC_MATERIALS
      } finally {
        if (!cancelled) setMaterialsLoading(false);
      }
    };
    fetchMaterials();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch tags from DB
  useEffect(() => {
    let cancelled = false;
    const fetchTags = async () => {
      try {
        setTagsLoading(true);
        const data =
          await api.get<{ name: string; nameAr: string; _id: string }[]>(
            "/api/filters/tags",
          );
        if (!cancelled) {
          setDbTags(Array.isArray(data) ? data : []);
        }
      } catch {
        // Silently fall back to FABRIC_TAGS
      } finally {
        if (!cancelled) setTagsLoading(false);
      }
    };
    fetchTags();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedColors = Array.isArray(formData.colors) ? formData.colors : [];

  const toggleColor = (colorValue: string) => {
    const current = Array.isArray(formData.colors) ? formData.colors : [];
    const newSelected = current.includes(colorValue)
      ? current.filter((c) => c !== colorValue)
      : [...current, colorValue];
    onFieldChange("colors", newSelected);
  };

  const handleUnitChange = (newUnit: FabricUnitValue) => {
    const currentStock = Number(formData.stockInMeters);
    if (currentStock > 0) {
      let convertedStock: number;
      if (newUnit === "wara") {
        convertedStock = currentStock / WARA_TO_METERS;
      } else {
        convertedStock = currentStock * WARA_TO_METERS;
      }
      onFieldChange("stockInMeters", Number(convertedStock.toFixed(2)));
    }
    onFieldChange("fabricUnit", newUnit);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onFieldChange("pricePerUnit", val);
      return;
    }
    if (/^\d*\.?\d*$/.test(val)) {
      onFieldChange("pricePerUnit", val);
    }
  };

  const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "") {
      onFieldChange("stockInMeters", val);
      return;
    }
    if (/^\d*\.?\d+$/.test(val) || /^\d+\.?\d*$/.test(val)) {
      const num = Number(val);
      if (!isNaN(num) && num >= 0) {
        onFieldChange("stockInMeters", val);
      }
    }
  };

  // Material options
  const materialOptionsEn = (
    dbMaterials.length > 0 ? dbMaterials : FABRIC_MATERIALS
  ).map((m) => ({
    value:
      "name" in m ? m.name : (m as (typeof FABRIC_MATERIALS)[number]).value,
    label: "name" in m ? m.name : (m as (typeof FABRIC_MATERIALS)[number]).en,
  }));
  const materialOptionsAr = (
    dbMaterials.length > 0 ? dbMaterials : FABRIC_MATERIALS
  ).map((m) => ({
    value:
      "nameAr" in m ? m.nameAr! : (m as (typeof FABRIC_MATERIALS)[number]).ar,
    label:
      "nameAr" in m ? m.nameAr! : (m as (typeof FABRIC_MATERIALS)[number]).ar,
  }));

  // Tag options
  const tagOptionsEn = (dbTags.length > 0 ? dbTags : FABRIC_TAGS).map((t) => ({
    value: "name" in t ? t.name : (t as (typeof FABRIC_TAGS)[number]).value,
    label: "name" in t ? t.name : (t as (typeof FABRIC_TAGS)[number]).en,
  }));
  const tagOptionsAr = (dbTags.length > 0 ? dbTags : FABRIC_TAGS).map((t) => ({
    value: "nameAr" in t ? t.nameAr! : (t as (typeof FABRIC_TAGS)[number]).ar,
    label: "nameAr" in t ? t.nameAr! : (t as (typeof FABRIC_TAGS)[number]).ar,
  }));

  // Custom trigger for select fields
  const SelectTrigger = ({
    value,
    placeholder,
    displayValue,
    onClick,
  }: {
    value: string;
    placeholder: string;
    displayValue: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full py-1 border-b border-gray-300 focus:border-black text-left bg-transparent text-xs sm:text-[14px] flex items-center justify-between hover:cursor-pointer"
    >
      <span className={value ? "text-black" : "text-gray-400"}>
        {displayValue || placeholder}
      </span>
      <span className="text-gray-400">▾</span>
    </button>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
      {/* Name (EN) */}
      <FormField
        label="Name (EN)"
        name="name"
        required
        error={fieldErrors.name}
      >
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onFieldChange("name", e.target.value)}
          className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none hover:cursor-text text-xs sm:text-sm"
          placeholder="Silk Fabric"
        />
      </FormField>

      {/* Name (AR) */}
      <FormField
        label="Name (AR)"
        name="nameAr"
        required
        error={fieldErrors.nameAr}
      >
        <input
          type="text"
          value={formData.nameAr}
          onChange={(e) => onFieldChange("nameAr", e.target.value)}
          className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none text-right hover:cursor-text text-xs sm:text-sm"
          placeholder="قماش حرير"
        />
      </FormField>

      {/* Description (EN) */}
      <FormField
        label="Description (EN)"
        name="description"
        error={fieldErrors.description}
      >
        <input
          type="text"
          value={formData.description}
          onChange={(e) => onFieldChange("description", e.target.value)}
          className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none hover:cursor-text text-xs sm:text-sm"
          placeholder="Describe the fabric..."
        />
      </FormField>

      {/* Description (AR) */}
      <FormField
        label="Description (AR)"
        name="descriptionAr"
        error={fieldErrors.descriptionAr}
      >
        <input
          type="text"
          value={formData.descriptionAr}
          onChange={(e) => onFieldChange("descriptionAr", e.target.value)}
          className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none text-right hover:cursor-text text-xs sm:text-sm"
          placeholder="وصف القماش..."
        />
      </FormField>

      {/* Material (EN) */}
      <FormField
        label="Material (EN)"
        name="material"
        required
        error={fieldErrors.material}
      >
        <AnimatedDropdown
          isOpen={openMaterialEn}
          onClose={() => setOpenMaterialEn(false)}
          trigger={
            <SelectTrigger
              value={formData.material}
              placeholder="Select material"
              displayValue={
                materialOptionsEn.find((o) => o.value === formData.material)
                  ?.label || ""
              }
              onClick={() => setOpenMaterialEn(!openMaterialEn)}
            />
          }
          dropdownClassName="w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto py-1"
          position="bottom-left"
        >
          <button
            type="button"
            onClick={() => {
              onFieldChange("material", "" as FabricMaterialValue);
              setOpenMaterialEn(false);
            }}
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
          >
            Select material
          </button>
          {materialOptionsEn.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onFieldChange("material", opt.value as FabricMaterialValue);
                setOpenMaterialEn(false);
              }}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </AnimatedDropdown>
      </FormField>

      {/* Material (AR) */}
      <FormField
        label="Material (AR)"
        name="materialAr"
        required
        error={fieldErrors.materialAr}
      >
        <AnimatedDropdown
          isOpen={openMaterialAr}
          onClose={() => setOpenMaterialAr(false)}
          trigger={
            <button
              type="button"
              onClick={() => setOpenMaterialAr(!openMaterialAr)}
              className="w-full py-1 border-b border-gray-300 focus:border-black text-right bg-transparent text-xs sm:text-[14px] flex items-center justify-between flex-row-reverse hover:cursor-pointer"
            >
              <span
                className={formData.materialAr ? "text-black" : "text-gray-400"}
              >
                {materialOptionsAr.find((o) => o.value === formData.materialAr)
                  ?.label || "اختر النوع"}
              </span>
              <span className="text-gray-400">▾</span>
            </button>
          }
          dropdownClassName="w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto py-1"
          position="bottom-left"
        >
          <button
            type="button"
            onClick={() => {
              onFieldChange("materialAr", "");
              setOpenMaterialAr(false);
            }}
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-right text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
          >
            اختر النوع
          </button>
          {materialOptionsAr.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onFieldChange("materialAr", opt.value);
                setOpenMaterialAr(false);
              }}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-right text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </AnimatedDropdown>
      </FormField>

      {/* Colors */}
      <FormField
        label="Colors"
        name="colors"
        required
        error={fieldErrors.color}
      >
        <AnimatedDropdown
          isOpen={openColors}
          onClose={() => setOpenColors(false)}
          trigger={
            <button
              type="button"
              onClick={() => setOpenColors(!openColors)}
              className="w-full py-1 border-b border-gray-300 focus:border-black text-left bg-transparent min-h-7 flex items-center hover:cursor-pointer"
            >
              {selectedColors.length === 0 ? (
                <span className="text-[10px] sm:text-xs text-black/60 leading-none">
                  Select colors
                </span>
              ) : (
                <div className="flex flex-wrap gap-1 sm:gap-1.5 items-center">
                  {COLOR_OPTIONS.filter((c) =>
                    selectedColors.includes(c.value),
                  ).map((c) => (
                    <span
                      key={c.value}
                      className="inline-flex items-center justify-center"
                      title={c.en}
                    >
                      <span
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-gray-200 shrink-0"
                        style={{ background: c.hex }}
                      />
                    </span>
                  ))}
                </div>
              )}
            </button>
          }
          dropdownClassName="w-full bg-white rounded-xl shadow-lg border border-gray-200 p-1.5 sm:p-3 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full"
          position="bottom-left"
        >
          <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 sm:gap-1">
            {COLOR_OPTIONS.map((opt) => {
              const selected = selectedColors.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-1 sm:gap-1.5 cursor-pointer px-1 py-0.5 hover:bg-gray-50 rounded hover:cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleColor(opt.value)}
                    className="accent-black w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 hover:cursor-pointer"
                  />
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 min-w-0">
                    <span
                      className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-gray-200 shrink-0"
                      style={{ background: opt.hex }}
                    />
                    <span className="text-[8px] sm:text-[10px] lg:text-xs truncate hover:cursor-pointer">
                      {opt.en} / {opt.ar}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </AnimatedDropdown>
      </FormField>

      {/* Store Partner */}
      <div className="md:col-span-2">
        <StorePartnerPicker
          value={formData.listedByStore}
          onChange={(partnerId) => onFieldChange("listedByStore", partnerId)}
          error={fieldErrors.listedByStore}
          label="Store Partner"
          placeholder="Select store partner"
          loadingLabel="Loading..."
          emptyLabel="No partners found"
          required
        />
      </div>

      {/* Tag (EN) */}
      <FormField label="Tag (EN)" name="tag" error={fieldErrors.tag}>
        <AnimatedDropdown
          isOpen={openTagEn}
          onClose={() => setOpenTagEn(false)}
          trigger={
            <SelectTrigger
              value={formData.tag}
              placeholder="Select tag (optional)"
              displayValue={
                tagOptionsEn.find((o) => o.value === formData.tag)?.label || ""
              }
              onClick={() => setOpenTagEn(!openTagEn)}
            />
          }
          dropdownClassName="w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto py-1"
          position="bottom-left"
        >
          <button
            type="button"
            onClick={() => {
              onFieldChange("tag", "");
              setOpenTagEn(false);
            }}
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
          >
            Select tag (optional)
          </button>
          {tagOptionsEn.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onFieldChange("tag", opt.value);
                setOpenTagEn(false);
              }}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </AnimatedDropdown>
      </FormField>

      {/* Tag (AR) */}
      <FormField label="Tag (AR)" name="tagAr" error={fieldErrors.tagAr}>
        <AnimatedDropdown
          isOpen={openTagAr}
          onClose={() => setOpenTagAr(false)}
          trigger={
            <button
              type="button"
              onClick={() => setOpenTagAr(!openTagAr)}
              className="w-full py-1 border-b border-gray-300 focus:border-black text-right bg-transparent text-xs sm:text-[14px] flex items-center justify-between flex-row-reverse hover:cursor-pointer"
            >
              <span className={formData.tagAr ? "text-black" : "text-gray-400"}>
                {tagOptionsAr.find((o) => o.value === formData.tagAr)?.label ||
                  "اختر الوسم (اختياري)"}
              </span>
              <span className="text-gray-400">▾</span>
            </button>
          }
          dropdownClassName="w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto py-1"
          position="bottom-left"
        >
          <button
            type="button"
            onClick={() => {
              onFieldChange("tagAr", "");
              setOpenTagAr(false);
            }}
            className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-right text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
          >
            اختر الوسم (اختياري)
          </button>
          {tagOptionsAr.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onFieldChange("tagAr", opt.value);
                setOpenTagAr(false);
              }}
              className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-right text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
            >
              {opt.label}
            </button>
          ))}
        </AnimatedDropdown>
      </FormField>

      {/* Fabric Unit, Price, Stock */}
      <div className="md:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end">
          {/* Fabric Unit */}
          <FormField label="Unit" name="fabricUnit">
            <AnimatedDropdown
              isOpen={openUnit}
              onClose={() => setOpenUnit(false)}
              trigger={
                <button
                  type="button"
                  onClick={() => setOpenUnit(!openUnit)}
                  className="w-full py-1 border-b border-gray-300 focus:border-black text-left bg-transparent min-h-7 flex items-center justify-between hover:cursor-pointer"
                >
                  <span className="text-xs sm:text-sm">
                    {formData.fabricUnit === "meters" ? "Meters" : "Wara"}
                  </span>
                  <span className="text-gray-400">▾</span>
                </button>
              }
              dropdownClassName="w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto py-1"
              position="bottom-left"
            >
              <button
                type="button"
                onClick={() => {
                  handleUnitChange("meters" as FabricUnitValue);
                  setOpenUnit(false);
                }}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
              >
                Meters
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUnitChange("wara" as FabricUnitValue);
                  setOpenUnit(false);
                }}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
              >
                Wara
              </button>
            </AnimatedDropdown>
          </FormField>

          {/* Price Per Unit */}
          <FormField
            label="Price Per (meter / wara)"
            name="pricePerUnit"
            required
            error={fieldErrors.pricePerUnit}
          >
            <input
              type="text"
              inputMode="decimal"
              value={formData.pricePerUnit}
              onChange={handlePriceChange}
              className={`w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none hover:cursor-text text-xs sm:text-sm ${
                fieldErrors.pricePerUnit ? "border-red-500" : ""
              }`}
              placeholder="150.00"
            />
          </FormField>

          {/* Stock */}
          <FormField
            label="Stock"
            name="stockInMeters"
            required
            error={fieldErrors.stockInMeters}
          >
            <input
              type="text"
              step={0.1}
              min={0}
              inputMode="decimal"
              value={formData.stockInMeters}
              onChange={handleStockChange}
              className={`w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none hover:cursor-text text-xs sm:text-sm ${
                fieldErrors.stockInMeters ? "border-red-500" : ""
              }`}
              placeholder="100.00"
            />
          </FormField>
        </div>
      </div>

      {/* Pickup Address */}
      <div className="md:col-span-2">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Store Pickup Address
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <FormField
            label="Emirate"
            name="pickupAddress.emirate"
            required
            error={fieldErrors["pickupAddress.emirate"]}
          >
            <AnimatedDropdown
              isOpen={openEmirate}
              onClose={() => setOpenEmirate(false)}
              trigger={
                <SelectTrigger
                  value={formData.pickupAddress.emirate}
                  placeholder="Select emirate"
                  displayValue={
                    UAE_EMIRATES.find(
                      (e) => e.value === formData.pickupAddress.emirate,
                    )?.en || ""
                  }
                  onClick={() => setOpenEmirate(!openEmirate)}
                />
              }
              dropdownClassName="w-full bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-y-auto py-1"
              position="bottom-left"
            >
              <button
                type="button"
                onClick={() => {
                  onPickupChange("emirate", "");
                  setOpenEmirate(false);
                }}
                className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
              >
                Select emirate
              </button>
              {UAE_EMIRATES.map((emirate) => (
                <button
                  key={emirate.value}
                  type="button"
                  onClick={() => {
                    onPickupChange("emirate", emirate.value);
                    setOpenEmirate(false);
                  }}
                  className="w-full px-3 sm:px-4 py-1.5 sm:py-2 text-left text-xs sm:text-sm hover:bg-gray-100 hover:cursor-pointer"
                >
                  {emirate.en} / {emirate.ar}
                </button>
              ))}
            </AnimatedDropdown>
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
              onChange={(e) => onPickupChange("city", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none hover:cursor-text text-xs sm:text-sm"
              placeholder="e.g., Deira"
            />
          </FormField>

          <FormField label="Street" name="pickupAddress.street" required>
            <input
              type="text"
              value={formData.pickupAddress.street}
              onChange={(e) => onPickupChange("street", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none hover:cursor-text text-xs sm:text-sm"
              placeholder="e.g., Al Maktoum Street"
            />
          </FormField>

          <FormField label="Building" name="pickupAddress.building" required>
            <input
              type="text"
              value={formData.pickupAddress.building}
              onChange={(e) => onPickupChange("building", e.target.value)}
              className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none hover:cursor-text text-xs sm:text-sm"
              placeholder="e.g., Al Fattan Tower"
            />
          </FormField>

          <FormField
            label="Phone"
            name="pickupAddress.phone"
            error={fieldErrors["pickupAddress.phone"]}
            required
          >
            <div className="flex items-center border-b border-gray-300 focus-within:border-black bg-transparent">
              <span className="inline-flex items-center px-3 py-1 bg-neutral-50 text-neutral-400 text-xs sm:text-[14px] select-none border-r border-gray-200">
                +971
              </span>
              <input
                type="text"
                value={formData.pickupAddress.phone}
                onChange={(e) => {
                  const val = e.target.value;
                  if ((val === "" || /^\d*$/.test(val)) && val.length <= 9) {
                    onPickupChange("phone", val);
                  }
                }}
                className="w-full py-1 pl-3 bg-transparent text-xs sm:text-[14px] focus:outline-none hover:cursor-text"
                placeholder="123456777"
              />
            </div>
          </FormField>
        </div>
      </div>

      {/* Images */}
      <div className="md:col-span-2">
        <div className="mb-2 flex justify-between items-center">
          <span className="font-label-sm text-[10px] sm:text-[11px] text-black/60 uppercase tracking-[0.2em]">
            Images (max 5) *
          </span>
          {formData.images.length < 5 && (
            <button
              type="button"
              onClick={onAddImage}
              className="text-[10px] sm:text-xs text-black underline hover:cursor-pointer"
            >
              + Add Image
            </button>
          )}
        </div>
        {formData.images.map((url, idx) => (
          <div key={idx} className="mb-4">
            <FabricImageUpload
              value={url}
              onChange={(val) => onImageChange(idx, val)}
              chooseFileLabel="Upload Image"
              uploadingLabel="Uploading..."
              uploadFailedLabel="Upload failed"
              removeLabel="Remove"
              error={
                fieldErrors.images && idx === 0 ? fieldErrors.images : undefined
              }
            />
            {formData.images.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                className="text-[10px] sm:text-xs text-red-500 mt-1 hover:cursor-pointer"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Active Status */}
      <div className="md:col-span-2">
        <FormField label="Active Status" name="isActive">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => onFieldChange("isActive", e.target.checked)}
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 hover:cursor-pointer"
            />
            <label
              htmlFor="isActive"
              className="text-xs sm:text-sm text-gray-700 hover:cursor-pointer"
            >
              Product is active (visible to customers)
            </label>
          </div>
        </FormField>
      </div>

      {/* Variations Section */}
      <div className="md:col-span-2 pt-6 mt-6 border-t border-gray-200 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-semibold text-black tracking-wider uppercase">
              Fabric Variations
            </h3>
            <p className="text-gray-500 text-xs mt-1">
              Add different variations of this fabric (e.g., other colors, stock
              levels)
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              onFieldChange("variants", [
                ...(formData.variants || []),
                {
                  name: "",
                  nameAr: "",
                  slug: "",
                  description: formData.description || "",
                  descriptionAr: formData.descriptionAr || "",
                  images: [""],
                  material: formData.material,
                  materialAr: formData.materialAr,
                  colors: [],
                  tag: "",
                  tagAr: "",
                  fabricUnit: formData.fabricUnit || "meters",
                  pricePerUnit: formData.pricePerUnit || 0,
                  pricePerMeter: formData.pricePerMeter || 0,
                  stockInMeters: 0,
                  listedByStore: formData.listedByStore || "",
                  pickupAddress: formData.pickupAddress || {
                    emirate: "",
                    city: "",
                    street: "",
                    building: "",
                    phone: "",
                  },
                  isActive: true,
                },
              ]);
            }}
            className="px-3 sm:px-4 py-1.5 sm:py-2 border border-black text-xs uppercase tracking-wider hover:bg-black hover:text-white transition font-medium hover:cursor-pointer"
          >
            + Add Variant
          </button>
        </div>

        {formData.variants && formData.variants.length > 0 && (
          <div className="space-y-6">
            {formData.variants.map((variant, index) => {
              const prefix = `variants.${index}`;
              return (
                <div
                  key={index}
                  className="p-4 sm:p-6 border border-gray-200 bg-[#FAF9F5] space-y-6 relative rounded-none animate-fadeIn"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-gray-200 gap-2">
                    <span className="font-label-sm text-xs text-black/60 uppercase tracking-widest font-semibold">
                      Variant #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onFieldChange(
                          "variants",
                          (formData.variants || []).filter(
                            (_, i) => i !== index,
                          ),
                        );
                      }}
                      className="text-xs text-red-600 hover:underline font-medium hover:cursor-pointer"
                    >
                      Remove Variant
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <FormField
                      label="Name (EN)"
                      name={`${prefix}.name`}
                      error={fieldErrors[`${prefix}.name`]}
                      required
                    >
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          const nextVariants = [...(formData.variants || [])];
                          nextVariants[index] = {
                            ...nextVariants[index],
                            name: val,
                          };
                          if (!nextVariants[index].slug) {
                            const slugBase = val
                              .toLowerCase()
                              .replace(/[^a-z0-9\s-]/g, "")
                              .replace(/\s+/g, "-")
                              .replace(/-+/g, "-")
                              .replace(/^-+|-+$/g, "");
                            nextVariants[index].slug = slugBase;
                          }
                          onFieldChange("variants", nextVariants);
                        }}
                        className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none bg-transparent text-xs sm:text-sm hover:cursor-text"
                        placeholder="e.g. Red Silk"
                      />
                    </FormField>

                    <FormField
                      label="Name (AR)"
                      name={`${prefix}.nameAr`}
                      error={fieldErrors[`${prefix}.nameAr`]}
                      required
                    >
                      <input
                        type="text"
                        value={variant.nameAr}
                        onChange={(e) => {
                          const nextVariants = [...(formData.variants || [])];
                          nextVariants[index] = {
                            ...nextVariants[index],
                            nameAr: e.target.value,
                          };
                          onFieldChange("variants", nextVariants);
                        }}
                        className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none bg-transparent text-right text-xs sm:text-sm hover:cursor-text"
                        placeholder="مثال: حرير أحمر"
                        dir="rtl"
                      />
                    </FormField>

                    <FormField
                      label="Slug"
                      name={`${prefix}.slug`}
                      error={fieldErrors[`${prefix}.slug`]}
                      required
                    >
                      <input
                        type="text"
                        value={variant.slug}
                        onChange={(e) => {
                          const nextVariants = [...(formData.variants || [])];
                          nextVariants[index] = {
                            ...nextVariants[index],
                            slug: e.target.value,
                          };
                          onFieldChange("variants", nextVariants);
                        }}
                        className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none bg-transparent text-xs sm:text-sm hover:cursor-text"
                        placeholder="e.g. red-silk"
                      />
                    </FormField>

                    {/* VARIANT MATERIAL */}
                    <FormField
                      label="Material"
                      name={`${prefix}.material`}
                      error={fieldErrors[`${prefix}.material`]}
                      required
                    >
                      <select
                        value={variant.material}
                        onChange={(e) => {
                          const val = e.target.value;
                          const nextVariants = [...(formData.variants || [])];
                          const found = (
                            dbMaterials.length > 0
                              ? dbMaterials
                              : FABRIC_MATERIALS
                          ).find((m) =>
                            "value" in m ? m.value === val : m.name === val,
                          );
                          const nameAr = found
                            ? "nameAr" in found
                              ? found.nameAr
                              : (found as any).ar
                            : "";
                          nextVariants[index] = {
                            ...nextVariants[index],
                            material: val as FabricMaterialValue | "",
                            materialAr: nameAr || "",
                          };
                          onFieldChange("variants", nextVariants);
                        }}
                        className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none bg-transparent text-xs sm:text-sm hover:cursor-pointer"
                      >
                        <option value="">Select material</option>
                        {(dbMaterials.length > 0
                          ? dbMaterials.map((m) => ({
                              value: m.name,
                              label: m.name,
                            }))
                          : FABRIC_MATERIALS.map((m) => ({
                              value: m.value,
                              label: m.en,
                            }))
                        ).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </FormField>

                    {/* VARIANT COLORS */}
                    <div className="md:col-span-2">
                      <FormField
                        label="Colors"
                        name={`${prefix}.colors`}
                        error={fieldErrors[`${prefix}.colors`]}
                        required
                      >
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenVariantColorDropdown((prev) =>
                                prev === index ? null : index,
                              )
                            }
                            className="w-full py-1 border-b border-gray-300 focus:border-black text-left bg-transparent min-h-7 flex items-center justify-between gap-2 hover:cursor-pointer"
                          >
                            {!variant.colors || variant.colors.length === 0 ? (
                              <span className="text-[10px] sm:text-xs text-black/60 leading-none">
                                Select colors
                              </span>
                            ) : (
                              <div className="flex flex-wrap gap-1 sm:gap-1.5 items-center">
                                {COLOR_OPTIONS.filter((c) =>
                                  variant.colors?.includes(c.value),
                                ).map((c) => (
                                  <span
                                    key={c.value}
                                    className="inline-flex items-center justify-center"
                                    title={c.en}
                                  >
                                    <span
                                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-gray-200 shrink-0"
                                      style={{ background: c.hex }}
                                    />
                                  </span>
                                ))}
                              </div>
                            )}
                            <ChevronDown
                              size={14}
                              className={`shrink-0 text-black/40 transition-transform duration-200 ${
                                openVariantColorDropdown === index
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>

                          <AnimatePresence>
                            {openVariantColorDropdown === index && (
                              <motion.div
                                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-sm p-1.5 sm:p-3 z-50 origin-top max-h-60 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full"
                              >
                                <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 sm:gap-1">
                                  {COLOR_OPTIONS.map((opt) => {
                                    const isSelected = variant.colors?.includes(
                                      opt.value,
                                    );
                                    return (
                                      <label
                                        key={opt.value}
                                        className="flex items-center gap-1 sm:gap-1.5 cursor-pointer px-1 py-0.5 hover:bg-gray-50 rounded hover:cursor-pointer"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={() => {
                                            const currentColors =
                                              variant.colors || [];
                                            const nextColors =
                                              currentColors.includes(opt.value)
                                                ? currentColors.filter(
                                                    (col) => col !== opt.value,
                                                  )
                                                : [...currentColors, opt.value];
                                            const nextVariants = [
                                              ...(formData.variants || []),
                                            ];
                                            nextVariants[index] = {
                                              ...nextVariants[index],
                                              colors: nextColors,
                                            };
                                            onFieldChange(
                                              "variants",
                                              nextVariants,
                                            );
                                          }}
                                          className="accent-black w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 hover:cursor-pointer"
                                        />
                                        <span className="inline-flex items-center gap-1 sm:gap-1.5 min-w-0">
                                          <span
                                            className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full border border-gray-200 shrink-0"
                                            style={{ background: opt.hex }}
                                          />
                                          <span className="text-[8px] sm:text-[10px] lg:text-xs truncate hover:cursor-pointer">
                                            {opt.en} / {opt.ar}
                                          </span>
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </FormField>
                    </div>

                    <FormField
                      label="Price Per Meter (AED)"
                      name={`${prefix}.pricePerMeter`}
                      error={fieldErrors[`${prefix}.pricePerMeter`]}
                      required
                    >
                      <input
                        type="text"
                        inputMode="decimal"
                        value={
                          variant.pricePerMeter === 0
                            ? ""
                            : variant.pricePerMeter
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d*\.?\d*$/.test(val)) {
                            const nextVariants = [...(formData.variants || [])];
                            nextVariants[index] = {
                              ...nextVariants[index],
                              pricePerMeter: val,
                              pricePerUnit: val,
                            };
                            onFieldChange("variants", nextVariants);
                          }
                        }}
                        className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none bg-transparent text-xs sm:text-sm hover:cursor-text"
                        placeholder="0.00"
                      />
                    </FormField>

                    <FormField
                      label="Stock in Meters"
                      name={`${prefix}.stockInMeters`}
                      error={fieldErrors[`${prefix}.stockInMeters`]}
                      required
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          variant.stockInMeters === 0
                            ? ""
                            : variant.stockInMeters
                        }
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "" || /^\d*$/.test(val)) {
                            const nextVariants = [...(formData.variants || [])];
                            nextVariants[index] = {
                              ...nextVariants[index],
                              stockInMeters: val,
                            };
                            onFieldChange("variants", nextVariants);
                          }
                        }}
                        className="w-full py-1 border-b border-gray-300 focus:border-black focus:outline-none bg-transparent text-xs sm:text-sm hover:cursor-text"
                        placeholder="e.g. 50"
                      />
                    </FormField>

                    <FormField
                      label="Active Status"
                      name={`${prefix}.isActive`}
                    >
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="checkbox"
                          id={`${prefix}.isActive`}
                          checked={variant.isActive}
                          onChange={(e) => {
                            const nextVariants = [...(formData.variants || [])];
                            nextVariants[index] = {
                              ...nextVariants[index],
                              isActive: e.target.checked,
                            };
                            onFieldChange("variants", nextVariants);
                          }}
                          className="w-3.5 h-3.5 sm:w-4 sm:h-4 hover:cursor-pointer"
                        />
                        <label
                          htmlFor={`${prefix}.isActive`}
                          className="text-[10px] sm:text-xs text-gray-700 hover:cursor-pointer"
                        >
                          Active (visible to customers)
                        </label>
                      </div>
                    </FormField>

                    <div className="md:col-span-2 space-y-2">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                        <span className="font-label-sm text-[10px] text-black/60 uppercase tracking-widest font-semibold">
                          Images (Max 5)
                        </span>
                        {variant.images.length < 5 && (
                          <button
                            type="button"
                            onClick={() => {
                              const nextVariants = [
                                ...(formData.variants || []),
                              ];
                              nextVariants[index] = {
                                ...nextVariants[index],
                                images: [...nextVariants[index].images, ""],
                              };
                              onFieldChange("variants", nextVariants);
                            }}
                            className="text-[10px] sm:text-xs text-black underline hover:text-neutral-700 font-medium hover:cursor-pointer"
                          >
                            + Add Image
                          </button>
                        )}
                      </div>
                      {fieldErrors[`${prefix}.images`] && (
                        <p className="text-[10px] sm:text-xs text-red-500 mb-2">
                          {fieldErrors[`${prefix}.images`]}
                        </p>
                      )}
                      {variant.images.map((imgUrl, imgIdx) => (
                        <div
                          key={imgIdx}
                          className="p-3 sm:p-4 border border-gray-100 bg-white rounded-none space-y-2"
                        >
                          <FabricImageUpload
                            value={imgUrl}
                            onChange={(val) => {
                              const nextVariants = [
                                ...(formData.variants || []),
                              ];
                              const nextImgs = [...nextVariants[index].images];
                              nextImgs[imgIdx] = val;
                              nextVariants[index] = {
                                ...nextVariants[index],
                                images: nextImgs,
                              };
                              onFieldChange("variants", nextVariants);
                            }}
                            chooseFileLabel="Upload Image"
                            uploadingLabel="Uploading..."
                            uploadFailedLabel="Upload failed"
                            removeLabel="Remove"
                          />
                          {variant.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextVariants = [
                                  ...(formData.variants || []),
                                ];
                                const nextImgs = nextVariants[
                                  index
                                ].images.filter((_, i) => i !== imgIdx);
                                nextVariants[index] = {
                                  ...nextVariants[index],
                                  images: nextImgs,
                                };
                                onFieldChange("variants", nextVariants);
                              }}
                              className="text-[10px] sm:text-xs text-red-500 hover:underline hover:cursor-pointer"
                            >
                              Remove image from list
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
