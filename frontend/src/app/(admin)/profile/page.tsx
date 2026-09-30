"use client";

import React, { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import {
    Save,
    Upload,
    X,
    User,
    Building,
    Mail,
    Phone,
    MapPin,
    Briefcase,
    Globe,
    Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/providers/AuthProvider";

// ==================== TYPES ====================
interface DistanceRate {
    id?: string;
    label?: string;
    minKm: number;
    maxKm: number;
    price: number;
}

interface ProfileData {
    id: string | null;
    companyName: string;
    slug?: string;
    legalName?: string;
    email: string;
    phone: string;
    fax?: string;
    website?: string;
    address: string;
    city?: string;
    postalCode?: string;
    country?: string;
    taxNumber?: string;
    rib?: string;
    iban?: string;
    bankName?: string;
    vatRate?: number;
    currency?: string;
    defaultPaymentTerms?: number;
    invoicePrefix?: string;
    pricingType?: "FIXED" | "HOURLY" | "DISTANCE" | "CUSTOM";
    status?: "ACTIVE" | "TRIAL" | "SUSPENDED" | "CANCELLED";
    timezone?: string;
    locale?: string;
    logo?: string;
    distanceRates?: DistanceRate[];
    createdAt: string | null;
    updatedAt: string | null;
}

interface UpdateProfileDto {
    id?: string;
    companyName?: string;
    slug?: string;
    legalName?: string;
    email?: string;
    phone?: string;
    fax?: string;
    website?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    taxNumber?: string;
    rib?: string;
    iban?: string;
    bankName?: string;
    vatRate?: number;
    currency?: string;
    defaultPaymentTerms?: number;
    invoicePrefix?: string;
    pricingType?: string;
    status?: string;
    timezone?: string;
    locale?: string;
    distanceRates?: DistanceRate[];
}

// ==================== API ====================
const API = process.env.NEXT_PUBLIC_API_URL;

const fetchProfile = async (companyId: string): Promise<ProfileData> => {
    const url = companyId
        ? `${API}/company-settings?id=${encodeURIComponent(companyId)}`
        : `${API}/company-settings`;

    const r = await fetch(url);
    if (!r.ok) throw new Error("Failed to fetch profile");
    return r.json();
};

const updateProfile = async (data: UpdateProfileDto): Promise<ProfileData> => {
    const r = await fetch(`${API}/company-settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.message || "Failed to update profile");
    }
    return r.json();
};

const uploadLogo = async (
    file: File,
    companyId: string
): Promise<{ logo: string }> => {
    const fd = new FormData();
    fd.append("logo", file);
    const r = await fetch(
        `${API}/company-settings/logo?id=${encodeURIComponent(companyId)}`,
        { method: "POST", body: fd }
    );
    if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.message || "Failed to upload logo");
    }
    return r.json();
};

const deleteLogo = async (companyId: string): Promise<void> => {
    const r = await fetch(
        `${API}/company-settings/logo?id=${encodeURIComponent(companyId)}`,
        { method: "DELETE" }
    );
    if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        throw new Error(e.message || "Failed to delete logo");
    }
};

const getLogoUrl = (logoPath?: string): string => {
    if (!logoPath) return "";
    if (logoPath.startsWith("http://") || logoPath.startsWith("https://"))
        return logoPath;
    if (logoPath.startsWith("/uploads")) return `${API}${logoPath}`;
    return `${API}uploads/logos/${logoPath}`;
};

// ==================== COMPONENT ====================
export default function ProfilePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { user, isLoading: authLoading } = useAuth();

    // 👇 Company id, same source as the sidebar
    const companyId: string = user?.companyId ?? "";

    const [formData, setFormData] = useState<UpdateProfileDto>({
        companyName: "",
        slug: "",
        legalName: "",
        email: "",
        phone: "",
        fax: "",
        website: "",
        address: "",
        city: "",
        postalCode: "",
        country: "TN",
        taxNumber: "",
        rib: "",
        iban: "",
        bankName: "",
        vatRate: 0,
        currency: "TND",
        defaultPaymentTerms: 30,
        invoicePrefix: "INV-",
        pricingType: "FIXED",
        status: "ACTIVE",
        timezone: "Africa/Tunis",
        locale: "fr-TN",
        distanceRates: [],
    });

    const [logoPreview, setLogoPreview] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // ==================== QUERY ====================
    const { data: profile, isLoading } = useQuery<ProfileData>({
        queryKey: ["profile", companyId],
        queryFn: () => fetchProfile(companyId),
        enabled: !authLoading,
    });

    useEffect(() => {
        if (!profile) return;

        setFormData({
            id: profile.id ?? companyId ?? undefined,
            companyName: profile.companyName || "",
            slug: profile.slug || "",
            legalName: profile.legalName || "",
            email: profile.email || "",
            phone: profile.phone || "",
            fax: profile.fax || "",
            website: profile.website || "",
            address: profile.address || "",
            city: profile.city || "",
            postalCode: profile.postalCode || "",
            country: profile.country || "TN",
            taxNumber: profile.taxNumber || "",
            rib: profile.rib || "",
            iban: profile.iban || "",
            bankName: profile.bankName || "",
            vatRate: profile.vatRate ?? 0,
            currency: profile.currency || "TND",
            defaultPaymentTerms: profile.defaultPaymentTerms ?? 30,
            invoicePrefix: profile.invoicePrefix || "INV-",
            pricingType: profile.pricingType || "FIXED",
            status: profile.status || "ACTIVE",
            timezone: profile.timezone || "Africa/Tunis",
            locale: profile.locale || "fr-TN",
            distanceRates: profile.distanceRates || [],
        });
        setLogoPreview(getLogoUrl(profile.logo));
    }, [profile, companyId]);

    // ==================== MUTATIONS ====================
    const updateProfileMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            queryClient.setQueryData(["profile", companyId], data);
            showToast("✅ Profile updated successfully", "success");
        },
        onError: (e: Error) => showToast(`❌ ${e.message}`, "error"),
    });

    const uploadLogoMutation = useMutation({
        mutationFn: ({ file, companyId }: { file: File; companyId: string }) =>
            uploadLogo(file, companyId),
        onSuccess: (data) => {
            const cur = queryClient.getQueryData<ProfileData>(["profile", companyId]);
            if (cur)
                queryClient.setQueryData(["profile", companyId], {
                    ...cur,
                    logo: data.logo,
                });
            setLogoPreview(getLogoUrl(data.logo));
            showToast("✅ Logo uploaded successfully", "success");
        },
        onError: (e: Error) => showToast(`❌ ${e.message}`, "error"),
    });

    const deleteLogoMutation = useMutation({
        mutationFn: (companyId: string) => deleteLogo(companyId),
        onSuccess: () => {
            setLogoPreview("");
            const cur = queryClient.getQueryData<ProfileData>(["profile", companyId]);
            if (cur)
                queryClient.setQueryData(["profile", companyId], { ...cur, logo: "" });
            showToast("✅ Logo removed successfully", "success");
        },
        onError: (e: Error) => showToast(`❌ ${e.message}`, "error"),
    });

    // ==================== HANDLERS ====================
    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToastMsg(msg);
        setToastType(type);
        setToastOpen(true);
    };

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "number" ? (value === "" ? undefined : Number(value)) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const payload: UpdateProfileDto = {
            ...formData,
            id: formData.id ?? profile?.id ?? companyId ?? undefined,
        };

        if (!payload.id) {
            showToast("❌ No company id available — cannot update", "error");
            return;
        }

        updateProfileMutation.mutate(payload);
    };

    // Distance rates
    const handleAddDistanceRate = () => {
        setFormData((p) => ({
            ...p,
            distanceRates: [
                ...(p.distanceRates || []),
                { minKm: 0, maxKm: 0, price: 0 },
            ],
        }));
    };

    const handleDistanceRateChange = (
        index: number,
        field: keyof DistanceRate,
        value: string | number
    ) => {
        setFormData((p) => {
            const rates = [...(p.distanceRates || [])];
            rates[index] = { ...rates[index], [field]: value };
            return { ...p, distanceRates: rates };
        });
    };

    const handleRemoveDistanceRate = (index: number) => {
        setFormData((p) => ({
            ...p,
            distanceRates: (p.distanceRates || []).filter((_, i) => i !== index),
        }));
    };

    // Logo
    const handleFileUpload = (file: File) => {
        if (!companyId) {
            showToast("❌ No company id available — cannot upload logo", "error");
            return;
        }
        const valid = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
        if (!valid.includes(file.type)) {
            showToast("❌ Please upload PNG, JPG, WEBP, or SVG images", "error");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            showToast("❌ File size should be less than 2MB", "error");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target?.result as string);
        reader.readAsDataURL(file);
        uploadLogoMutation.mutate({ file, companyId });
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFileUpload(f);
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };
    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) handleFileUpload(f);
    };
    const handleRemoveLogo = () => {
        if (!companyId) {
            showToast("❌ No company id available — cannot delete logo", "error");
            return;
        }
        if (logoPreview) deleteLogoMutation.mutate(companyId);
    };
    const handleBack = () => router.push("/admin/dashboard");

    // ==================== LOADING ====================
    if (isLoading || authLoading) {
        return (
            <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-center items-center h-64">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
            </div>
        );
    }

    // ==================== RENDER ====================
    return (
        <Toast.Provider>
            <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleBack}
                        className="rounded-md px-4 py-2 text-white hover:bg-blue-700 transition-colors"
                    />
                    <h1 className="text-2xl font-bold text-black dark:text-white">
                        Profile Settings
                    </h1>
                    <div className="w-32" />
                </div>

                <div className="space-y-6">
                    {/* LOGO */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                            <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                                <Building className="w-5 h-5" /> Company Logo
                            </h3>
                        </div>
                        <div className="p-6.5">
                            <div className="flex flex-col md:flex-row items-start gap-6">
                                <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg border-2 border-stroke bg-gray-50 dark:bg-gray-800">
                                    {logoPreview ? (
                                        <Image
                                            src={logoPreview}
                                            alt="Company logo"
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                                            <Building className="h-12 w-12" />
                                            <span className="text-xs mt-1">No logo</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 w-full">
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${isDragging
                                            ? "border-primary bg-primary/5 dark:bg-primary/10"
                                            : "border-stroke hover:border-primary dark:border-strokedark"
                                            }`}
                                    >
                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Drag & drop your logo here, or{" "}
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="text-primary hover:underline font-medium"
                                            >
                                                browse files
                                            </button>
                                        </p>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".png,.jpg,.jpeg,.webp,.svg"
                                            onChange={handleFileInput}
                                            className="hidden"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            PNG, JPG, WEBP, SVG • Max 2MB • 500x500px
                                        </p>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadLogoMutation.isPending}
                                            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                                        >
                                            {uploadLogoMutation.isPending ? (
                                                <>
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{" "}
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="h-4 w-4" /> Upload Logo
                                                </>
                                            )}
                                        </button>

                                        {logoPreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
                                                disabled={deleteLogoMutation.isPending}
                                                className="flex items-center gap-2 rounded-md border border-red-500 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 transition-colors"
                                            >
                                                {deleteLogoMutation.isPending ? (
                                                    <>
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />{" "}
                                                        Removing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <X className="h-4 w-4" /> Remove Logo
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PROFILE INFO */}
                    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                            <h3 className="text-lg font-semibold text-black dark:text-white flex items-center gap-2">
                                <User className="w-5 h-5" /> Profile Information
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="p-6.5">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <Field
                                        label="Company Name"
                                        icon={
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        }
                                    >
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName || ""}
                                            onChange={handleFormChange}
                                            placeholder="Company Name"
                                            className={inputCls}
                                        />
                                    </Field>

                                    <Field label="Legal Name">
                                        <input
                                            type="text"
                                            name="legalName"
                                            value={formData.legalName || ""}
                                            onChange={handleFormChange}
                                            placeholder="Registered legal name"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field label="Slug">
                                        <input
                                            type="text"
                                            name="slug"
                                            value={formData.slug || ""}
                                            onChange={handleFormChange}
                                            placeholder="acme-sarl"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field
                                        label="Email Address"
                                        icon={
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        }
                                    >
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email || ""}
                                            onChange={handleFormChange}
                                            placeholder="company@example.com"
                                            className={inputCls}
                                        />
                                    </Field>

                                    <Field
                                        label="Phone Number"
                                        icon={
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        }
                                    >
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone || ""}
                                            onChange={handleFormChange}
                                            placeholder="+216 XX XXX XXX"
                                            className={inputCls}
                                        />
                                    </Field>

                                    <Field label="Fax">
                                        <input
                                            type="text"
                                            name="fax"
                                            value={formData.fax || ""}
                                            onChange={handleFormChange}
                                            placeholder="+216 XX XXX XXX"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field label="Website">
                                        <input
                                            type="url"
                                            name="website"
                                            value={formData.website || ""}
                                            onChange={handleFormChange}
                                            placeholder="https://example.com"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field
                                        label="Address"
                                        icon={
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        }
                                    >
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address || ""}
                                            onChange={handleFormChange}
                                            placeholder="123 Business Street"
                                            className={inputCls}
                                        />
                                    </Field>

                                    <Field label="City">
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city || ""}
                                            onChange={handleFormChange}
                                            placeholder="Tunis"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field label="Postal Code">
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={formData.postalCode || ""}
                                            onChange={handleFormChange}
                                            placeholder="1000"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field label="Country">
                                        <input
                                            type="text"
                                            name="country"
                                            value={formData.country || ""}
                                            onChange={handleFormChange}
                                            placeholder="TN"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field
                                        label="Tax Number (Matricule Fiscale)"
                                        icon={
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        }
                                    >
                                        <input
                                            type="text"
                                            name="taxNumber"
                                            value={formData.taxNumber || ""}
                                            onChange={handleFormChange}
                                            placeholder="123456789"
                                            className={inputCls}
                                        />
                                    </Field>

                                    <Field
                                        label="RIB"
                                        icon={
                                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        }
                                    >
                                        <input
                                            type="text"
                                            name="rib"
                                            value={formData.rib || ""}
                                            onChange={handleFormChange}
                                            placeholder="RI123456789"
                                            className={inputCls}
                                        />
                                    </Field>

                                    <Field label="IBAN">
                                        <input
                                            type="text"
                                            name="iban"
                                            value={formData.iban || ""}
                                            onChange={handleFormChange}
                                            placeholder="TN59..."
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field label="Bank Name">
                                        <input
                                            type="text"
                                            name="bankName"
                                            value={formData.bankName || ""}
                                            onChange={handleFormChange}
                                            placeholder="Bank"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field label="VAT Rate (%)">
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="vatRate"
                                            value={formData.vatRate ?? ""}
                                            onChange={handleFormChange}
                                            placeholder="19"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field label="Currency">
                                        <select
                                            name="currency"
                                            value={formData.currency || "TND"}
                                            onChange={handleFormChange}
                                            className={inputClsNoPad}
                                        >
                                            <option value="TND">TND</option>
                                            <option value="EUR">EUR</option>
                                            <option value="USD">USD</option>
                                        </select>
                                    </Field>

                                    <Field label="Payment Terms (days)">
                                        <input
                                            type="number"
                                            name="defaultPaymentTerms"
                                            value={formData.defaultPaymentTerms ?? ""}
                                            onChange={handleFormChange}
                                            placeholder="30"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field label="Invoice Prefix">
                                        <input
                                            type="text"
                                            name="invoicePrefix"
                                            value={formData.invoicePrefix || ""}
                                            onChange={handleFormChange}
                                            placeholder="INV-"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field label="Pricing Type">
                                        <select
                                            name="pricingType"
                                            value={formData.pricingType || "FIXED"}
                                            onChange={handleFormChange}
                                            className={inputClsNoPad}
                                        >
                                            <option value="FIXED">FIXED</option>
                                            <option value="HOURLY">HOURLY</option>
                                            <option value="DISTANCE">DISTANCE</option>
                                            <option value="CUSTOM">CUSTOM</option>
                                        </select>
                                    </Field>

                                    <Field label="Status">
                                        <select
                                            name="status"
                                            value={formData.status || "ACTIVE"}
                                            onChange={handleFormChange}
                                            className={inputClsNoPad}
                                        >
                                            <option value="ACTIVE">ACTIVE</option>
                                            <option value="TRIAL">TRIAL</option>
                                            <option value="SUSPENDED">SUSPENDED</option>
                                            <option value="CANCELLED">CANCELLED</option>
                                        </select>
                                    </Field>

                                    <Field label="Timezone">
                                        <input
                                            type="text"
                                            name="timezone"
                                            value={formData.timezone || ""}
                                            onChange={handleFormChange}
                                            placeholder="Africa/Tunis"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    <Field label="Locale">
                                        <input
                                            type="text"
                                            name="locale"
                                            value={formData.locale || ""}
                                            onChange={handleFormChange}
                                            placeholder="fr-TN"
                                            className={inputClsNoPad}
                                        />
                                    </Field>

                                    {/* DISTANCE RATES */}
                                    <div className="md:col-span-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="text-sm font-medium text-black dark:text-white flex items-center gap-2">
                                                <MapPin className="h-5 w-5 text-gray-400" /> Distance
                                                Rates
                                            </label>
                                            <button
                                                type="button"
                                                onClick={handleAddDistanceRate}
                                                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                            >
                                                <Plus className="h-4 w-4" /> Add Rate
                                            </button>
                                        </div>

                                        {(formData.distanceRates || []).length === 0 ? (
                                            <p className="text-sm text-gray-500 dark:text-gray-400 rounded-lg border border-dashed border-stroke p-4 text-center dark:border-strokedark">
                                                No distance rates configured yet.
                                            </p>
                                        ) : (
                                            <div className="space-y-3">
                                                {(formData.distanceRates || []).map((rate, index) => (
                                                    <div
                                                        key={index}
                                                        className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end rounded-lg border border-stroke p-3 dark:border-strokedark"
                                                    >
                                                        <div>
                                                            <label className="mb-1 block text-xs text-gray-500">
                                                                Min (km)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={rate.minKm}
                                                                onChange={(e) =>
                                                                    handleDistanceRateChange(
                                                                        index,
                                                                        "minKm",
                                                                        Number(e.target.value)
                                                                    )
                                                                }
                                                                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="mb-1 block text-xs text-gray-500">
                                                                Max (km)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={rate.maxKm}
                                                                onChange={(e) =>
                                                                    handleDistanceRateChange(
                                                                        index,
                                                                        "maxKm",
                                                                        Number(e.target.value)
                                                                    )
                                                                }
                                                                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                            />
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <div className="flex-1">
                                                                <label className="mb-1 block text-xs text-gray-500">
                                                                    Price
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={rate.price}
                                                                    onChange={(e) =>
                                                                        handleDistanceRateChange(
                                                                            index,
                                                                            "price",
                                                                            Number(e.target.value)
                                                                        )
                                                                    }
                                                                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                                                />
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveDistanceRate(index)}
                                                                className="mb-0.5 rounded-md border border-red-500 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                                title="Remove rate"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        disabled={updateProfileMutation.isPending}
                                        className="border border-stroke flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-medium hover:bg-primary-dark disabled:opacity-50 transition-colors"
                                    >
                                        {updateProfileMutation.isPending ? (
                                            <>
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />{" "}
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-5 w-5" /> Save Profile
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <Toast.Root
                    open={toastOpen}
                    onOpenChange={setToastOpen}
                    className={`fixed top-20 right-4 w-80 rounded-md p-4 shadow-lg z-50 ${toastType === "success"
                        ? "bg-green-600 dark:bg-green-700 text-white"
                        : "bg-red-600 dark:bg-red-700 text-white"
                        }`}
                    duration={3000}
                >
                    <Toast.Title className="font-medium">{toastMsg}</Toast.Title>
                </Toast.Root>
                <Toast.Viewport className="fixed top-4 right-4 z-50 outline-none" />
            </div>
        </Toast.Provider>
    );
}

// ==================== HELPERS ====================
const inputCls =
    "w-full rounded-lg border-[1.5px] border-stroke bg-transparent pl-10 pr-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white";

const inputClsNoPad =
    "w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white";

function Field({
    label,
    icon,
    children,
}: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                {label}
            </label>
            <div className="relative">
                {icon}
                {children}
            </div>
        </div>
    );
}