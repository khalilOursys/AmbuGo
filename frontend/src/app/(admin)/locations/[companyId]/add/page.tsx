"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import { ArrowLeft, Save, Edit } from "lucide-react";

interface Location {
  id: string;
  name: string;
  type: string;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  email: string | null;
  notes: string | null;
  companyId: string | null;
}

interface UpdateLocationDto {
  name?: string;
  type?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  website?: string;
  email?: string;
  notes?: string;
}

const fetchLocation = async (id: string): Promise<Location> => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/locations/${id}`
  );
  if (!response.ok) throw new Error("Failed to fetch location");
  return response.json();
};

const updateLocation = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateLocationDto;
}) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/locations/${id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update location");
  }
  return response.json();
};

export default function EditLocationPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const companyId = params.companyId as string;
  const locationId = params.id as string;

  const [formData, setFormData] = useState<UpdateLocationDto>({
    name: "",
    type: "HOSPITAL",
    phone: "",
    address: "",
    latitude: undefined,
    longitude: undefined,
    website: "",
    email: "",
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

  const { data: location, isLoading: isLoadingLocation } = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => fetchLocation(locationId),
    enabled: !!locationId,
  });

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        type: location.type,
        phone: location.phone || "",
        address: location.address || "",
        latitude: location.latitude ?? undefined,
        longitude: location.longitude ?? undefined,
        website: location.website || "",
        email: location.email || "",
        notes: location.notes || "",
      });
    }
  }, [location]);

  const updateMutation = useMutation({
    mutationFn: updateLocation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      queryClient.invalidateQueries({ queryKey: ["location", locationId] });
      showToast("✅ Location updated successfully", "success");
      setTimeout(() => router.push(`/locations/${companyId}`), 1500);
    },
    onError: (error: Error) => {
      showToast(`❌ ${error.message}`, "error");
    },
    onSettled: () => setIsSubmitting(false),
  });

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!formData.name) {
      showToast("Name is required", "error");
      setIsSubmitting(false);
      return;
    }

    const payload: UpdateLocationDto = {
      ...formData,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      website: formData.website || undefined,
      email: formData.email || undefined,
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

    updateMutation.mutate({ id: locationId, data: payload });
  };

  const handleCancel = () => router.push(`/locations/${companyId}`);

  if (isLoadingLocation) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <Toast.Provider>
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleCancel}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Locations
          </button>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
              <Edit className="w-6 h-6" />
              Edit Location
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Company ID: {companyId}
            </p>
          </div>

          <form onSubmit={submitForm}>
            <div className="p-6.5">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Name <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="HOSPITAL">Hospital</option>
                    <option value="CLINIC">Clinic</option>
                    <option value="MEDICAL_CENTER">Medical Center</option>
                    <option value="PHARMACY">Pharmacy</option>
                    <option value="NURSING_HOME">Nursing Home</option>
                    <option value="RESIDENCE">Residence</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

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
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
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
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
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
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
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
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update Location
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