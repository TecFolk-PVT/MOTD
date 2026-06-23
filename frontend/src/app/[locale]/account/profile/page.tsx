// components/account/ProfileTab.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit,
  Save,
  XCircle,
  Camera,
  Check,
  AlertCircle,
} from "lucide-react";

type Address = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

type CustomerProfile = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  avatar?: string; // URL or base64
  address?: Address;
};

export default function ProfileTab() {
  const { user: authUser } = useAuth();

  // ----- State -----
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<CustomerProfile>>({});
  const [saveStatus, setSaveStatus] = useState<{
    type: "idle" | "saving" | "success" | "error";
    message?: string;
  }>({ type: "idle" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ----- Fetch profile -----
  useEffect(() => {
    async function fetchProfile() {
      if (!authUser) return;
      try {
        setIsLoading(true);
        const res = await fetch("/api/users/profile");
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          dateOfBirth: data.dateOfBirth || "",
          avatar: data.avatar || "",
          address: {
            street: data.address?.street || "",
            city: data.address?.city || "",
            state: data.address?.state || "",
            postalCode: data.address?.postalCode || "",
            country: data.address?.country || "",
          },
        });
        if (data.avatar) setAvatarPreview(data.avatar);
      } catch (err) {
        console.warn("Profile API unavailable, using auth data:", err);
        if (authUser) {
          const fallback: CustomerProfile = {
            id: authUser.id,
            name: authUser.name || "",
            email: authUser.email || "",
          };
          setProfile(fallback);
          setFormData(fallback);
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [authUser]);

  // ----- Handlers -----
  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel: reset form, clear avatar preview
      if (profile) {
        setFormData({
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          dateOfBirth: profile.dateOfBirth || "",
          avatar: profile.avatar || "",
          address: {
            street: profile.address?.street || "",
            city: profile.address?.city || "",
            state: profile.address?.state || "",
            postalCode: profile.address?.postalCode || "",
            country: profile.address?.country || "",
          },
        });
        setAvatarPreview(profile.avatar || null);
        setAvatarFile(null);
      }
      setSaveStatus({ type: "idle" });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: { ...(prev.address || {}), [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (saveStatus.type === "error" || saveStatus.type === "success") {
      setSaveStatus({ type: "idle" });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      setSaveStatus({ type: "error", message: "Name is required." });
      return;
    }
    if (!formData.email?.trim()) {
      setSaveStatus({ type: "error", message: "Email is required." });
      return;
    }

    setSaveStatus({ type: "saving" });
    try {
      // Prepare payload – if avatarFile exists, upload it first (or send as base64)
      let payload = { ...formData };
      if (avatarFile) {
        // Option A: Send as base64 (simpler)
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(avatarFile);
        });
        payload.avatar = base64;
      }

      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Update failed");
      }
      const updated = await res.json();
      setProfile(updated);
      setFormData({
        name: updated.name || "",
        email: updated.email || "",
        phone: updated.phone || "",
        dateOfBirth: updated.dateOfBirth || "",
        avatar: updated.avatar || "",
        address: {
          street: updated.address?.street || "",
          city: updated.address?.city || "",
          state: updated.address?.state || "",
          postalCode: updated.address?.postalCode || "",
          country: updated.address?.country || "",
        },
      });
      if (updated.avatar) setAvatarPreview(updated.avatar);
      setAvatarFile(null);
      setSaveStatus({
        type: "success",
        message: "Profile updated successfully!",
      });
      setIsEditing(false);
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        message: err.message || "Something went wrong. Please try again.",
      });
    }
  };

  // ----- Loading state -----
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3">Loading profile…</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-8 text-center text-gray-500">
        No profile data available.
      </div>
    );
  }

  // ----- Helper to render field display or input -----
  const renderField = (
    label: string,
    name: string,
    value: string | undefined,
    icon: React.ReactNode,
    type = "text",
    placeholder = "",
  ) => {
    const isAddress = name.startsWith("address.");
    const fieldName = isAddress ? name : name;
    return (
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          {isEditing ? (
            <input
              type={type}
              name={fieldName}
              value={value || ""}
              onChange={handleInputChange}
              placeholder={placeholder}
              className={`w-full ${icon ? "pl-9" : "pl-4"} pr-4 py-2.5 border rounded-xl 
                focus:ring-2 focus:ring-black/10 focus:border-black 
                bg-gray-50 border-gray-300 transition`}
            />
          ) : (
            <div
              className={`w-full ${icon ? "pl-9" : "pl-4"} pr-4 py-2.5 
              border border-transparent rounded-xl bg-transparent text-gray-800 
              font-medium`}
            >
              {value || "—"}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ----- Render -----
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Status messages */}
      {saveStatus.type === "success" && (
        <div className="m-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <Check className="w-5 h-5" />
          {saveStatus.message}
        </div>
      )}
      {saveStatus.type === "error" && (
        <div className="m-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {saveStatus.message}
        </div>
      )}

      <div className="p-6 sm:p-8">
        {/* Top row: Avatar + Edit button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden border-2 border-gray-200 shadow-md">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl sm:text-4xl font-medium text-gray-500">
                    {profile.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                )}
              </div>
              {isEditing && (
                <>
                  <button
                    onClick={triggerFileInput}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label="Change avatar"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    accept="image/*"
                    className="hidden"
                  />
                </>
              )}
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                {profile.name}
              </h3>
              <p className="text-gray-500 text-sm flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                {profile.email}
              </p>
              {profile.phone && (
                <p className="text-gray-500 text-sm flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {profile.phone}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleEditToggle}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap
              ${
                isEditing
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
          >
            {isEditing ? (
              <>
                <XCircle className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" />
                Edit Profile
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField(
            "Full Name",
            "name",
            formData.name,
            <User className="w-4 h-4" />,
          )}
          {renderField(
            "Email",
            "email",
            formData.email,
            <Mail className="w-4 h-4" />,
            "email",
          )}
          {renderField(
            "Phone",
            "phone",
            formData.phone,
            <Phone className="w-4 h-4" />,
            "tel",
          )}
          {renderField(
            "Date of Birth",
            "dateOfBirth",
            formData.dateOfBirth,
            <Calendar className="w-4 h-4" />,
            "date",
          )}
        </div>

        {/* Address */}
        <div className="mt-8">
          <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5" />
            Address
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {renderField(
              "Street",
              "address.street",
              formData.address?.street,
              null,
            )}
            {renderField("City", "address.city", formData.address?.city, null)}
            {renderField(
              "State/Province",
              "address.state",
              formData.address?.state,
              null,
            )}
            {renderField(
              "Postal Code",
              "address.postalCode",
              formData.address?.postalCode,
              null,
            )}
            {renderField(
              "Country",
              "address.country",
              formData.address?.country,
              null,
            )}
          </div>
        </div>

        {/* Save button (only when editing) */}
        {isEditing && (
          <div className="flex justify-end pt-6 mt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saveStatus.type === "saving"}
              className={`px-8 py-2.5 rounded-xl text-white font-medium transition flex items-center gap-2
                ${
                  saveStatus.type === "saving"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800"
                }`}
            >
              {saveStatus.type === "saving" ? (
                <>Saving…</>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
