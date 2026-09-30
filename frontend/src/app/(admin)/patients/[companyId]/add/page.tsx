"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import { ArrowLeft, Save, Plus, MapPin } from "lucide-react";
import LocationMapPicker from "@/components/LocationMapPicker";

interface CreatePatientDto {
  companyId?: string;
  firstname: string;
  lastname: string;
  birthDate?: string;
  phone?: string;
  gender?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

const createPatient = async (data: CreatePatientDto) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create patient");
  }
  return response.json();
};

export default function AddPatientPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const companyId = params.companyId as string;

  const [formData, setFormData] = useState<CreatePatientDto>({
    companyId,
    firstname: "",
    lastname: "",
    birthDate: "",
    phone: "",
    gender: "",
    address: "",
    latitude: undefined,
    longitude: undefined,
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const createMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      showToast("✅ Patient created successfully", "success");
      setTimeout(() => router.push(`/patients/${companyId}`), 1500);
    },
    onError: (error: Error) => {
      showToast(`❌ ${error.message || "Connection problem"}`, "error");
    },
    onSettled: () => setIsSubmitting(false),
  });

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!formData.firstname) {
      showToast("First name is required", "error");
      setIsSubmitting(false);
      return;
    }

    if (!formData.lastname) {
      showToast("Last name is required", "error");
      setIsSubmitting(false);
      return;
    }

    const payload: CreatePatientDto = {
      ...formData,
      birthDate: formData.birthDate || undefined,
      phone: formData.phone || undefined,
      gender: formData.gender || undefined,
      address: formData.address || undefined,
      notes: formData.notes || undefined,
      latitude:
        formData.latitude !== undefined && !isNaN(formData.latitude)
          ? Number(formData.latitude)
          : undefined,
      longitude:
        formData.longitude !== undefined && !isNaN(formData.longitude)
          ? Number(formData.longitude)
          : undefined,
    };

    createMutation.mutate(payload);
  };

  const handleCancel = () => router.push(`/patients/${companyId}`);

  return (
    <Toast.Provider>
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleCancel}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Patients
          </button>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
              <Plus className="w-6 h-6" />
              Add New Patient
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Company ID: {companyId}
            </p>
          </div>

          <form onSubmit={submitForm}>
            <div className="p-6.5">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* First Name */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    First Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstname}
                    onChange={(e) =>
                      setFormData({ ...formData, firstname: e.target.value })
                    }
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="John"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Last Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastname}
                    onChange={(e) =>
                      setFormData({ ...formData, lastname: e.target.value })
                    }
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="Doe"
                  />
                </div>

                {/* Birth Date */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) =>
                      setFormData({ ...formData, birthDate: e.target.value })
                    }
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="+21612345678"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="123 Main Street, Tunis"
                  />
                </div>

                {/* ---------------- MAP PICKER ---------------- */}
                <div className="md:col-span-2">
                  <label className="mb-3 flex items-center gap-2 text-sm font-medium text-black dark:text-white">
                    <MapPin className="h-4 w-4" />
                    Location on Map
                  </label>

                  <LocationMapPicker
                    latitude={formData.latitude}
                    longitude={formData.longitude}
                    onChange={({ latitude, longitude }) =>
                      setFormData((prev) => ({ ...prev, latitude, longitude }))
                    }
                    height={350}
                  />

                  {/* Manual fallback inputs */}
                  <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.latitude ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            latitude: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          })
                        }
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        placeholder="36.8065"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={formData.longitude ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            longitude: e.target.value
                              ? parseFloat(e.target.value)
                              : undefined,
                          })
                        }
                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-4 py-2 text-sm outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        placeholder="10.1815"
                      />
                    </div>
                  </div>
                </div>
                {/* ---------------- /MAP PICKER ---------------- */}

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="Medical notes, allergies, etc..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-md border border-stroke px-6 py-3 font-medium hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Patient
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`fixed top-20 right-4 w-80 rounded-md p-4 shadow-lg z-50 ${toastType === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
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