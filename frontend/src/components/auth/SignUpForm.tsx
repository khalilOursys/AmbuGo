"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import {
  Building2,
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  AlertCircle,
  CreditCard,
  FileText,
  Eye,
  EyeOff
} from "lucide-react";

// Types
interface CompanyData {
  name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  radiusKm: number;
  pricingType: "FIXED" | "PER_KM" | "DISTANCE_RANGE";
  baseCurrency: string;
  rib?: string;
  matriculeFiscale?: string;
  email: string;
  phone: string;
}

interface ManagerData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  telephone: string;
  cin: string;
}

interface SignUpData {
  company: CompanyData;
  manager: ManagerData;
}

// API function
const signUpCompany = async (data: SignUpData) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      company: {
        name: data.company.name,
        address: data.company.address,
        latitude: data.company.latitude,
        longitude: data.company.longitude,
        radiusKm: data.company.radiusKm,
        pricingType: data.company.pricingType,
        baseCurrency: data.company.baseCurrency,
        rib: data.company.rib,
        matriculeFiscale: data.company.matriculeFiscale,
        email: data.company.email,
        phone: data.company.phone,
      },
      manager: {
        email: data.manager.email,
        password: data.manager.password,
        firstName: data.manager.firstName,
        lastName: data.manager.lastName,
        telephone: data.manager.telephone,
        cin: data.manager.cin,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create company");
  }
  return response.json();
};

// Step 1: Company Information
const CompanyStep = ({ data, onChange }: { data: CompanyData; onChange: (data: Partial<CompanyData>) => void }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Company Name <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              required
              value={data.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent pl-10 pr-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              placeholder="e.g., Ambulance Services Tunisia"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Address
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={data.address || ""}
              onChange={(e) => onChange({ address: e.target.value })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent pl-10 pr-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              placeholder="123 Main Street, Tunis"
            />
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Email <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              required
              value={data.email || ""}
              onChange={(e) => onChange({ email: e.target.value })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent pl-10 pr-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              placeholder="contact@company.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Phone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="tel"
              value={data.phone || ""}
              onChange={(e) => onChange({ phone: e.target.value })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent pl-10 pr-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              placeholder="+216 71 123 456"
            />
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            RIB
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={data.rib || ""}
              onChange={(e) => onChange({ rib: e.target.value })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent pl-10 pr-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              placeholder="Bank account number"
            />
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Matricule Fiscale
          </label>
          <div className="relative">
            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              value={data.matriculeFiscale || ""}
              onChange={(e) => onChange({ matriculeFiscale: e.target.value })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent pl-10 pr-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              placeholder="Tax identification number"
            />
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Pricing Type
          </label>
          <select
            value={data.pricingType}
            onChange={(e) => onChange({ pricingType: e.target.value as CompanyData["pricingType"] })}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
          >
            <option value="FIXED">Fixed Price</option>
            <option value="PER_KM">Per Kilometer</option>
            <option value="DISTANCE_RANGE">Distance Range</option>
          </select>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Base Currency
          </label>
          <input
            type="text"
            value={data.baseCurrency}
            onChange={(e) => onChange({ baseCurrency: e.target.value })}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            placeholder="TND"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Service Radius (km)
          </label>
          <input
            type="number"
            value={data.radiusKm}
            onChange={(e) => onChange({ radiusKm: parseFloat(e.target.value) })}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            placeholder="10"
            min="1"
          />
        </div>
      </div>
    </div>
  );
};

// Step 2: Manager Information
const ManagerStep = ({ data, onChange }: { data: ManagerData; onChange: (data: Partial<ManagerData>) => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Email <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="email"
              required
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent pl-10 pr-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              placeholder="manager@company.com"
            />
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Password <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={data.password}
              onChange={(e) => onChange({ password: e.target.value })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent pl-10 pr-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              placeholder="Minimum 8 characters"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Confirm Password <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={data.confirmPassword}
              onChange={(e) => onChange({ confirmPassword: e.target.value })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent pl-10 pr-12 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            First Name
          </label>
          <input
            type="text"
            value={data.firstName || ""}
            onChange={(e) => onChange({ firstName: e.target.value })}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            placeholder="Ahmed"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Last Name
          </label>
          <input
            type="text"
            value={data.lastName || ""}
            onChange={(e) => onChange({ lastName: e.target.value })}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            placeholder="Ben Salah"
          />
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            Telephone
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="tel"
              value={data.telephone || ""}
              onChange={(e) => onChange({ telephone: e.target.value })}
              className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent pl-10 pr-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              placeholder="+216 98 765 432"
            />
          </div>
        </div>

        <div>
          <label className="mb-3 block text-sm font-medium text-black dark:text-white">
            CIN (National ID)
          </label>
          <input
            type="text"
            value={data.cin || ""}
            onChange={(e) => onChange({ cin: e.target.value })}
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            placeholder="12345678"
          />
        </div>
      </div>
    </div>
  );
};

// Step 3: Review
const ReviewStep = ({ data }: { data: SignUpData }) => {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-stroke bg-gray-50 p-6 dark:border-strokedark dark:bg-gray-800">
        <h4 className="mb-4 text-lg font-semibold text-black dark:text-white flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Company Information
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Company Name</p>
            <p className="font-medium text-black dark:text-white">{data.company.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Address</p>
            <p className="font-medium text-black dark:text-white">{data.company.address || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium text-black dark:text-white">{data.company.email || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
            <p className="font-medium text-black dark:text-white">{data.company.phone || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Pricing Type</p>
            <p className="font-medium text-black dark:text-white">{data.company.pricingType}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Base Currency</p>
            <p className="font-medium text-black dark:text-white">{data.company.baseCurrency}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Service Radius</p>
            <p className="font-medium text-black dark:text-white">{data.company.radiusKm} km</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Matricule Fiscale</p>
            <p className="font-medium text-black dark:text-white">{data.company.matriculeFiscale || "Not provided"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-stroke bg-gray-50 p-6 dark:border-strokedark dark:bg-gray-800">
        <h4 className="mb-4 text-lg font-semibold text-black dark:text-white flex items-center gap-2">
          <User className="h-5 w-5" />
          Manager Information
        </h4>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
            <p className="font-medium text-black dark:text-white">
              {data.manager.firstName} {data.manager.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
            <p className="font-medium text-black dark:text-white">{data.manager.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Telephone</p>
            <p className="font-medium text-black dark:text-white">{data.manager.telephone || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">CIN</p>
            <p className="font-medium text-black dark:text-white">{data.manager.cin || "Not provided"}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Please review all information before submitting. The manager will be created with ADMIN role by default.
        </p>
      </div>
    </div>
  );
};

// Main SignUp Component
export default function SignUpPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [formData, setFormData] = useState<SignUpData>({
    company: {
      name: "",
      address: "",
      radiusKm: 10,
      pricingType: "FIXED",
      baseCurrency: "TND",
      email: "",
      phone: "",
      rib: "",
      matriculeFiscale: "",
    },
    manager: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      telephone: "",
      cin: "",
    },
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const updateCompanyData = (data: Partial<CompanyData>) => {
    setFormData((prev) => ({
      ...prev,
      company: { ...prev.company, ...data },
    }));
  };

  const updateManagerData = (data: Partial<ManagerData>) => {
    setFormData((prev) => ({
      ...prev,
      manager: { ...prev.manager, ...data },
    }));
  };

  const validateStep = (step: number): boolean => {
    if (step === 1) {
      if (!formData.company.name.trim()) {
        showToast("Company name is required", "error");
        return false;
      }
      if (!formData.company.email.trim()) {
        showToast("Company email is required", "error");
        return false;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.company.email)) {
        showToast("Please enter a valid company email", "error");
        return false;
      }
      return true;
    }

    if (step === 2) {
      if (!formData.manager.email) {
        showToast("Manager email is required", "error");
        return false;
      }
      // Basic email validation for manager
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.manager.email)) {
        showToast("Please enter a valid manager email", "error");
        return false;
      }
      if (!formData.manager.password || formData.manager.password.length < 8) {
        showToast("Password must be at least 8 characters", "error");
        return false;
      }
      if (formData.manager.password !== formData.manager.confirmPassword) {
        showToast("Passwords do not match", "error");
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const signUpMutation = useMutation({
    mutationFn: signUpCompany,
    onSuccess: (data) => {
      showToast("✅ Company created successfully! Redirecting to login...", "success");
      if (data.access_token) {
        localStorage.setItem("token", data.access_token);
      }
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: (error: Error) => {
      showToast(`❌ ${error.message || "Failed to create company"}`, "error");
    },
  });

  const handleSubmit = async () => {
    signUpMutation.mutate(formData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CompanyStep data={formData.company} onChange={updateCompanyData} />;
      case 2:
        return <ManagerStep data={formData.manager} onChange={updateManagerData} />;
      case 3:
        return <ReviewStep data={formData} />;
      default:
        return null;
    }
  };

  return (
    <Toast.Provider>
      <div className="h-screen bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
        <div className="w-full max-w-4xl max-h-full flex flex-col">
          <div className="text-center mb-6 flex-shrink-0">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create Your Company Account
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Set up your company and manager account in 3 easy steps
            </p>
          </div>

          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6 md:p-8 flex flex-col flex-1 min-h-0">
            <div className="mb-6 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${currentStep === 1
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                      : currentStep > 1
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800"
                    }`}>
                    {currentStep > 1 ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <Building2 className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${currentStep === 1
                      ? "text-blue-600 dark:text-blue-400"
                      : currentStep > 1
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                    Company
                  </span>
                </div>

                <div className={`flex-1 h-0.5 transition-all duration-300 ${currentStep > 1 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                  }`} />

                <div className="flex flex-col items-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${currentStep === 2
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                      : currentStep > 2
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800"
                    }`}>
                    {currentStep > 2 ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${currentStep === 2
                      ? "text-blue-600 dark:text-blue-400"
                      : currentStep > 2
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                    Manager
                  </span>
                </div>

                <div className={`flex-1 h-0.5 transition-all duration-300 ${currentStep > 2 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                  }`} />

                <div className="flex flex-col items-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${currentStep === 3
                      ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/30"
                      : "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800"
                    }`}>
                    <Check className="h-6 w-6" />
                  </div>
                  <span className={`mt-2 text-sm font-medium ${currentStep === 3
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                    }`}>
                    Review
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-2 -mr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              <div className="mt-2">{renderStep()}</div>
            </div>

            <div className="mt-6 flex justify-between border-t border-stroke pt-6 dark:border-strokedark flex-shrink-0">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 rounded-lg px-6 py-2.5 font-medium transition-colors ${currentStep === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  }`}
              >
                <ArrowLeft className="h-5 w-5" />
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 font-medium text-white hover:bg-primary-dark transition-colors"
                >
                  Next
                  <ArrowRight className="h-5 w-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={signUpMutation.isPending}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-6 py-2.5 font-medium text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {signUpMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Check className="h-5 w-5" />
                      Create Account
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
            Already have an account?{" "}
            <a href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </a>
          </p>
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
    </Toast.Provider>
  );
}