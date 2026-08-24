// src/app/missions/[companyId]/add/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useCreateMission } from "@/hooks/useMissions";
import { CreateMissionDto } from "@/types/mission.types";

// Types
interface Customer {
  id: string;
  name: string;
  code?: string;
}

interface Patient {
  id: string;
  firstname: string;
  lastname: string;
  phone?: string;
}

interface Location {
  id: string;
  name: string;
  type: string;
  address?: string;
}

interface Contract {
  id: string;
  reference: string;
  title: string;
}

interface Equipment {
  id: string;
  code: string;
  name: string;
  description?: string;
  quantity: number;
}

// API Functions
const fetchCustomers = async (companyId?: string): Promise<Customer[]> => {
  if (!companyId) return [];
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/customers?companyId=${companyId}`);
  if (!response.ok) throw new Error("Failed to fetch customers");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const fetchPatients = async (): Promise<Patient[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/patients`);
  if (!response.ok) throw new Error("Failed to fetch patients");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const fetchLocations = async (): Promise<Location[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations`);
  if (!response.ok) throw new Error("Failed to fetch locations");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const fetchContracts = async (customerId?: string): Promise<Contract[]> => {
  if (!customerId) return [];
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contracts?customerId=${customerId}`);
  if (!response.ok) throw new Error("Failed to fetch contracts");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const fetchEquipment = async (companyId?: string): Promise<Equipment[]> => {
  if (!companyId) return [];
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipment?companyId=${companyId}`);
  if (!response.ok) throw new Error("Failed to fetch equipment");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const missionPriorities = [
  { value: "LOW", label: "Low" },
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High" },
  { value: "CRITICAL", label: "Critical" },
];

export default function CreateMissionPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.companyId as string;

  const createMission = useCreateMission();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateMissionDto>({
    priority: "NORMAL",
    reason: "",
    pickupAddress: "",
    destination: "",
    latitude: undefined,
    longitude: undefined,
    callDate: new Date().toISOString().slice(0, 16),
    customerId: "",
    contractId: "",
    patientId: "",
    locationId: "",
    notes: "",
    equipment: [],
  });

  // Queries
  const { data: customers = [] } = useQuery({
    queryKey: ["customers", companyId],
    queryFn: () => fetchCustomers(companyId),
    enabled: !!companyId,
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients"],
    queryFn: fetchPatients,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });

  const { data: contracts = [] } = useQuery({
    queryKey: ["contracts", formData.customerId],
    queryFn: () => fetchContracts(formData.customerId),
    enabled: !!formData.customerId,
  });

  const { data: equipmentList = [] } = useQuery({
    queryKey: ["equipment", companyId],
    queryFn: () => fetchEquipment(companyId),
    enabled: !!companyId,
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const handleEquipmentChange = (index: number, field: string, value: any) => {
    const updated = [...(formData.equipment || [])];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, equipment: updated }));
  };

  const handleAddEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...(prev.equipment || []), { equipmentId: "", quantity: 1 }],
    }));
  };

  const handleRemoveEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: (prev.equipment || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!companyId) {
      showToast("Company ID is required", "error");
      setIsSubmitting(false);
      return;
    }

    if (!formData.priority) {
      showToast("Priority is required", "error");
      setIsSubmitting(false);
      return;
    }

    const missionData: CreateMissionDto = {
      ...formData,
      callDate: formData.callDate ? new Date(formData.callDate).toISOString() : undefined,
      equipment: formData.equipment?.filter(e => e.equipmentId).map(e => ({
        equipmentId: e.equipmentId,
        quantity: e.quantity || 1,
      })),
    };

    try {
      await createMission.mutateAsync(missionData);
      showToast("✅ Mission created successfully", "success");
      setTimeout(() => router.push(`/missions/${companyId}`), 1500);
    } catch (error) {
      showToast(`❌ ${error instanceof Error ? error.message : "Connection error"}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => router.push(`/missions/${companyId}`);

  return (
    <Toast.Provider>
      <div className="p-6">
        <PageBreadcrumb pageTitle="Create Mission" />

        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleCancel}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            ← Back to list
          </button>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="text-xl font-semibold text-black dark:text-white">
              Mission Information
            </h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Priority */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Priority <span className="text-danger">*</span>
                  </label>
                  <select
                    required
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    {missionPriorities.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Call Date */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Call Date
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.callDate}
                    onChange={(e) => setFormData({ ...formData, callDate: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  />
                </div>

                {/* Customer */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Customer
                  </label>
                  <select
                    value={formData.customerId}
                    onChange={(e) => {
                      setFormData({ ...formData, customerId: e.target.value, contractId: "" });
                    }}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">Select customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.code && `(${c.code})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contract */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Contract
                  </label>
                  <select
                    value={formData.contractId}
                    onChange={(e) => setFormData({ ...formData, contractId: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    disabled={!formData.customerId}
                  >
                    <option value="">Select contract</option>
                    {contracts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.reference} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Patient
                  </label>
                  <select
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">Select patient</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.firstname} {p.lastname} {p.phone && `(${p.phone})`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Destination Location
                  </label>
                  <select
                    value={formData.locationId}
                    onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">Select location</option>
                    {locations.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} ({l.type}) {l.address && `- ${l.address}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Pickup Address */}
                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Pickup Address
                  </label>
                  <input
                    type="text"
                    value={formData.pickupAddress}
                    onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="Enter pickup address"
                  />
                </div>

                {/* Destination */}
                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Destination Address
                  </label>
                  <input
                    type="text"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="Enter destination address"
                  />
                </div>

                {/* Reason */}
                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Reason
                  </label>
                  <textarea
                    rows={3}
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="Describe the reason for the mission"
                  />
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="Additional notes"
                  />
                </div>

                {/* Coordinates */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || undefined })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="-90 to 90"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || undefined })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="-180 to 180"
                  />
                </div>
              </div>

              {/* Equipment Section */}
              <div className="mt-8 border-t border-stroke pt-6 dark:border-strokedark">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-black dark:text-white">
                    Equipment
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 transition-colors"
                  >
                    + Add Equipment
                  </button>
                </div>

                {equipmentList.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No equipment available for this company.
                  </p>
                )}

                {formData.equipment?.map((eq, index) => (
                  <div key={index} className="mb-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Equipment
                        </label>
                        <select
                          value={eq.equipmentId}
                          onChange={(e) => handleEquipmentChange(index, "equipmentId", e.target.value)}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Select equipment</option>
                          {equipmentList.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.code} - {item.name} (Available: {item.quantity})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={eq.quantity}
                          onChange={(e) => handleEquipmentChange(index, "quantity", Number(e.target.value))}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveEquipment(index)}
                      className="mt-3 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Remove this equipment
                    </button>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-md border border-stroke px-6 py-3 font-medium hover:bg-gray-100 dark:hover:bg-meta-4 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createMission.isPending}
                  className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting || createMission.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    "Create Mission"
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