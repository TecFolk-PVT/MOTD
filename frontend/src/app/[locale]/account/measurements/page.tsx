// components/account/MeasurementsForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api/client";
import { useRouter } from "next/navigation";
import {
  Ruler,
  Save,
  Loader2,
  X,
  User,
  Users,
  MapPin,
  Edit,
} from "lucide-react";
import toast from "react-hot-toast";

type MeasurementData = {
  totalLength: number | null;
  shoulderWidth: number | null;
  armLength: number | null;
  chestWidth: number | null;
  waist: number | null;
  hips: number | null;
  neckWidth: number | null;
  neckDepth: number | null;
  armholeHeight: number | null;
  sleeveOpeningWidth: number | null;
  cuffWidth: number | null;
  cuffLength: number | null;
  notes: string;
};

interface MeasurementsFormProps {
  onCancel?: () => void;
}

const FormField = ({
  label,
  name,
  required,
  error,
  children,
}: {
  label: string;
  name?: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <label
      htmlFor={name}
      className="block text-[10px] sm:text-xs uppercase tracking-widest text-gray-500"
    >
      {label} {required && "*"}
    </label>
    {children}
    {error && (
      <p className="text-red-500 text-[10px] sm:text-xs mt-1">{error}</p>
    )}
  </div>
);

const DEFAULT_MEASUREMENTS: MeasurementData = {
  totalLength: null,
  shoulderWidth: null,
  armLength: null,
  chestWidth: null,
  waist: null,
  hips: null,
  neckWidth: null,
  neckDepth: null,
  armholeHeight: null,
  sleeveOpeningWidth: null,
  cuffWidth: null,
  cuffLength: null,
  notes: "",
};

const DisplayField = ({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <div className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-transparent rounded-xl bg-transparent text-gray-800 font-medium text-sm sm:text-base">
      {value || "—"}
    </div>
  </div>
);

export default function MeasurementsForm({ onCancel }: MeasurementsFormProps) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<MeasurementData>(DEFAULT_MEASUREMENTS);
  const [hasExistingMeasurements, setHasExistingMeasurements] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    async function loadMeasurements() {
      if (!authUser) return;
      try {
        setLoading(true);
        const data = await api.get("/api/customer/customer_measurements");
        if (data.measurements) {
          setHasExistingMeasurements(true);
          // Store directly as inches (already in inches from DB)
          setForm({
            totalLength: data.measurements.totalLength,
            shoulderWidth: data.measurements.shoulderWidth,
            armLength: data.measurements.armLength,
            chestWidth: data.measurements.chestWidth,
            waist: data.measurements.waist,
            hips: data.measurements.hips,
            neckWidth: data.measurements.neckWidth,
            neckDepth: data.measurements.neckDepth,
            armholeHeight: data.measurements.armholeHeight,
            sleeveOpeningWidth: data.measurements.sleeveOpeningWidth,
            cuffWidth: data.measurements.cuffWidth,
            cuffLength: data.measurements.cuffLength,
            notes: data.measurements.notes || "",
          });
        } else {
          setHasExistingMeasurements(false);
          setIsEditing(true);
        }
      } catch (err: any) {
        if (err.status === 404) {
          setHasExistingMeasurements(false);
          setIsEditing(true);
        } else {
          toast.error(err.message || "Failed to load measurements");
        }
      } finally {
        setLoading(false);
      }
    }
    loadMeasurements();
  }, [authUser]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "notes") {
      setForm((prev) => ({ ...prev, notes: value }));
      if (fieldErrors[name]) {
        setFieldErrors((prev) => ({ ...prev, [name]: "" }));
      }
      return;
    }

    // Allow empty, positive numbers with decimals
    if (value === "") {
      setForm((prev) => ({ ...prev, [name]: null }));
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        // Keep exact decimal value - no rounding
        setForm((prev) => ({ ...prev, [name]: numValue }));
      }
    }

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const numberFields = [
      "totalLength",
      "shoulderWidth",
      "armLength",
      "chestWidth",
      "waist",
      "hips",
      "neckWidth",
      "neckDepth",
      "armholeHeight",
      "sleeveOpeningWidth",
      "cuffWidth",
      "cuffLength",
    ];

    numberFields.forEach((field) => {
      const value = form[field as keyof MeasurementData];
      if (
        value !== null &&
        value !== undefined &&
        typeof value === "number" &&
        value < 0
      ) {
        errors[field] = "Value must be 0 or greater";
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      const firstError = Object.values(fieldErrors).find(Boolean);
      if (firstError) toast.error(firstError);
      return;
    }
    setSubmitting(true);

    try {
      const payload: any = {};
      const fields = [
        "totalLength",
        "shoulderWidth",
        "armLength",
        "chestWidth",
        "waist",
        "hips",
        "neckWidth",
        "neckDepth",
        "armholeHeight",
        "sleeveOpeningWidth",
        "cuffWidth",
        "cuffLength",
        "notes",
      ];

      fields.forEach((field) => {
        const value = form[field as keyof MeasurementData];
        if (value !== null && value !== undefined && value !== "") {
          // Store directly as entered (inches) - no conversion
          payload[field] = field === "notes" ? value : Number(value);
        }
      });

      if (hasExistingMeasurements) {
        await api.put("/api/customer/customer_measurements", payload);
        toast.success("Measurements updated successfully!");
      } else {
        await api.post("/api/customer/customer_measurements", payload);
        toast.success("Measurements saved successfully!");
      }

      // Reload measurements and show view mode
      const data = await api.get("/api/customer/customer_measurements");
      if (data.measurements) {
        setHasExistingMeasurements(true);
        setForm({
          totalLength: data.measurements.totalLength,
          shoulderWidth: data.measurements.shoulderWidth,
          armLength: data.measurements.armLength,
          chestWidth: data.measurements.chestWidth,
          waist: data.measurements.waist,
          hips: data.measurements.hips,
          neckWidth: data.measurements.neckWidth,
          neckDepth: data.measurements.neckDepth,
          armholeHeight: data.measurements.armholeHeight,
          sleeveOpeningWidth: data.measurements.sleeveOpeningWidth,
          cuffWidth: data.measurements.cuffWidth,
          cuffLength: data.measurements.cuffLength,
          notes: data.measurements.notes || "",
        });
      }
      setIsEditing(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to save measurements");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setIsEditing(false);
    }
  };

  const measurementFields = [
    { key: "totalLength", label: "Total Length" },
    { key: "shoulderWidth", label: "Shoulder Width" },
    { key: "armLength", label: "Arm Length" },
    { key: "chestWidth", label: "Chest Width" },
    { key: "waist", label: "Waist" },
    { key: "hips", label: "Hips" },
    { key: "neckWidth", label: "Neck Width" },
    { key: "neckDepth", label: "Neck Depth" },
    { key: "armholeHeight", label: "Armhole Height" },
    { key: "sleeveOpeningWidth", label: "Sleeve Opening" },
    { key: "cuffWidth", label: "Cuff Width" },
    { key: "cuffLength", label: "Cuff Length" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 sm:p-12">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Show measurement view (not editing)
  if (hasExistingMeasurements && !isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-medium flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Body Measurements
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleEditClick}
                className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-medium bg-black text-white hover:bg-gray-800 transition flex items-center gap-2 hover:cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Edit Measurements
              </button>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition hover:cursor-pointer"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {measurementFields.map((field) => {
              const value = form[field.key as keyof MeasurementData];
              let displayValue: string = "—";
              if (value !== null && value !== undefined) {
                // Show exact value with up to 3 decimal places
                displayValue = `${Number(value).toFixed(2)} in`;
              }
              return (
                <DisplayField
                  key={field.key}
                  label={field.label}
                  value={displayValue}
                />
              );
            })}
            {form.notes && (
              <div className="sm:col-span-2 lg:col-span-3">
                <DisplayField label="Notes" value={form.notes} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show edit form (for new or editing)
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-medium flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            {hasExistingMeasurements ? "Edit Measurements" : "Add Measurements"}
          </h2>
          <button
            onClick={handleCancel}
            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition hover:cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Upper Body */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5" /> Upper Body
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <FormField
                label="Total Length (in)"
                name="totalLength"
                error={fieldErrors.totalLength}
              >
                <input
                  type="number"
                  name="totalLength"
                  value={form.totalLength ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 67.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>

              <FormField
                label="Shoulder Width (in)"
                name="shoulderWidth"
                error={fieldErrors.shoulderWidth}
              >
                <input
                  type="number"
                  name="shoulderWidth"
                  value={form.shoulderWidth ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 18.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>

              <FormField
                label="Arm Length (in)"
                name="armLength"
                error={fieldErrors.armLength}
              >
                <input
                  type="number"
                  name="armLength"
                  value={form.armLength ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 24.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>

              <FormField
                label="Chest Width (in)"
                name="chestWidth"
                error={fieldErrors.chestWidth}
              >
                <input
                  type="number"
                  name="chestWidth"
                  value={form.chestWidth ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 39.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>

              <FormField
                label="Neck Width (in)"
                name="neckWidth"
                error={fieldErrors.neckWidth}
              >
                <input
                  type="number"
                  name="neckWidth"
                  value={form.neckWidth ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 15.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>

              <FormField
                label="Neck Depth (in)"
                name="neckDepth"
                error={fieldErrors.neckDepth}
              >
                <input
                  type="number"
                  name="neckDepth"
                  value={form.neckDepth ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 3.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>

              <FormField
                label="Armhole Height (in)"
                name="armholeHeight"
                error={fieldErrors.armholeHeight}
              >
                <input
                  type="number"
                  name="armholeHeight"
                  value={form.armholeHeight ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 8.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>

              <FormField
                label="Sleeve Opening (in)"
                name="sleeveOpeningWidth"
                error={fieldErrors.sleeveOpeningWidth}
              >
                <input
                  type="number"
                  name="sleeveOpeningWidth"
                  value={form.sleeveOpeningWidth ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 6.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>
            </div>
          </div>

          {/* Lower Body */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" /> Lower Body
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <FormField
                label="Waist (in)"
                name="waist"
                error={fieldErrors.waist}
              >
                <input
                  type="number"
                  name="waist"
                  value={form.waist ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 31.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>

              <FormField label="Hips (in)" name="hips" error={fieldErrors.hips}>
                <input
                  type="number"
                  name="hips"
                  value={form.hips ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 39.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>

              <FormField
                label="Cuff Width (in)"
                name="cuffWidth"
                error={fieldErrors.cuffWidth}
              >
                <input
                  type="number"
                  name="cuffWidth"
                  value={form.cuffWidth ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 8.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>

              <FormField
                label="Cuff Length (in)"
                name="cuffLength"
                error={fieldErrors.cuffLength}
              >
                <input
                  type="number"
                  name="cuffLength"
                  value={form.cuffLength ?? ""}
                  onChange={handleChange}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "Minus") {
                      e.preventDefault();
                    }
                  }}
                  onWheel={(e) => e.preventDefault()}
                  placeholder="e.g. 2.5"
                  min="0"
                  step="0.01"
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent"
                />
              </FormField>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-sm sm:text-base font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" /> Additional Notes
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:gap-5">
              <FormField label="Notes" name="notes">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any special instructions or notes about measurements..."
                  rows={1}
                  className="w-full py-1 sm:py-1.5 text-sm sm:text-base border-b border-gray-300 focus:border-black outline-none bg-transparent resize-none overflow-hidden"
                  style={{ minHeight: "2.5rem" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = target.scrollHeight + "px";
                  }}
                />
              </FormField>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition hover:cursor-pointer w-full sm:w-auto"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base bg-black text-white rounded-lg hover:bg-gray-800 transition disabled:opacity-50 flex items-center justify-center gap-2 hover:cursor-pointer w-full sm:w-auto"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {hasExistingMeasurements
                ? "Update Measurements"
                : "Save Measurements"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
