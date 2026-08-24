// app/vehicles/[companyId]/add/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useCreateVehicle } from "@/hooks/useVehicles";
import { CreateVehicleDto } from "@/types/vehicle.types";

// Types
interface VehicleType {
  id: string;
  name: string;
}

interface StaffMember {
  id: string;
  matricule: string;
  firstname: string;
  lastname: string;
  type: string;
  email?: string;
  phone?: string;
}

interface Equipment {
  id: string;
  code: string;
  name: string;
  description?: string;
  quantity: number;
}

// API Functions
const fetchVehicleTypes = async (): Promise<VehicleType[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicle-types`);
  if (!response.ok) throw new Error("Échec de la récupération des types de véhicules");
  return response.json();
};

const fetchStaffMembers = async (companyId?: string): Promise<StaffMember[]> => {
  if (!companyId) return [];
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff?companyId=${companyId}`);
  if (!response.ok) throw new Error("Échec de la récupération du personnel");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const fetchEquipment = async (companyId?: string): Promise<Equipment[]> => {
  if (!companyId) return [];
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipment?companyId=${companyId}`);
  if (!response.ok) throw new Error("Échec de la récupération de l'équipement");
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const ambulanceLevels = [
  { value: "BLS", label: "BLS - Basic Life Support" },
  { value: "ALS", label: "ALS - Advanced Life Support" },
  { value: "ICU", label: "ICU - Intensive Care Unit" },
];

const vehicleStatuses = [
  { value: "AVAILABLE", label: "Disponible" },
  { value: "ASSIGNED", label: "Assigné" },
  { value: "BUSY", label: "Occupé" },
  { value: "MAINTENANCE", label: "En maintenance" },
  { value: "OFFLINE", label: "Hors ligne" },
];

const shiftTypes = [
  { value: "MORNING", label: "Matin (08:00 - 15:00)" },
  { value: "AFTERNOON", label: "Après-midi (15:00 - 22:00)" },
  { value: "NIGHT", label: "Nuit (22:00 - 08:00)" },
  { value: "CUSTOM", label: "Personnalisé" },
];

export default function AddVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.companyId as string;

  const createVehicle = useCreateVehicle();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    registration: "",
    brand: "",
    model: "",
    level: "BLS" as "BLS" | "ALS" | "ICU",
    status: "AVAILABLE" as "AVAILABLE" | "ASSIGNED" | "BUSY" | "MAINTENANCE" | "OFFLINE",
    vehicleTypeId: "",
    staffSchedules: [] as {
      staffId: string;
      shiftStart: string;
      shiftEnd: string;
      shiftType: string;
      isRecurring: boolean;
      recurrenceRule?: string;
      validFrom: string;
      validUntil?: string;
      notes?: string;
    }[],
    equipment: [] as {
      equipmentId: string;
      quantity: number;
    }[],
  });

  // Queries
  const { data: vehicleTypes = [] } = useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: fetchVehicleTypes,
  });

  const { data: staffMembers = [] } = useQuery({
    queryKey: ["staffMembers", companyId],
    queryFn: () => fetchStaffMembers(companyId),
    enabled: !!companyId,
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

  // Staff schedule handlers
  const handleAddStaffSchedule = () => {
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(8, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(17, 0, 0, 0);

    setFormData(prev => ({
      ...prev,
      staffSchedules: [
        ...prev.staffSchedules,
        {
          staffId: "",
          shiftStart: startOfDay.toISOString(),
          shiftEnd: endOfDay.toISOString(),
          shiftType: "CUSTOM",
          isRecurring: false,
          validFrom: now.toISOString(),
          notes: "",
        },
      ],
    }));
  };

  const handleRemoveStaffSchedule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      staffSchedules: prev.staffSchedules.filter((_, i) => i !== index),
    }));
  };

  const handleStaffScheduleChange = (index: number, field: string, value: any) => {
    const updated = [...formData.staffSchedules];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, staffSchedules: updated }));
  };

  // Equipment handlers
  const handleAddEquipment = () => {
    setFormData(prev => ({
      ...prev,
      equipment: [...prev.equipment, { equipmentId: "", quantity: 1 }],
    }));
  };

  const handleRemoveEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }));
  };

  const handleEquipmentChange = (index: number, field: string, value: any) => {
    const updated = [...formData.equipment];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, equipment: updated }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Validation
    if (!companyId) {
      showToast("ID de compagnie manquant", "error");
      setIsSubmitting(false);
      return;
    }

    if (!formData.registration) {
      showToast("L'immatriculation est requise", "error");
      setIsSubmitting(false);
      return;
    }

    if (!formData.level) {
      showToast("Veuillez sélectionner un niveau d'ambulance", "error");
      setIsSubmitting(false);
      return;
    }

    // Prepare data with correct types
    const vehicleData: CreateVehicleDto = {
      companyId: companyId,
      registration: formData.registration,
      brand: formData.brand || undefined,
      model: formData.model || undefined,
      level: formData.level,
      status: formData.status,
      vehicleTypeId: formData.vehicleTypeId || undefined,
      staffSchedules: formData.staffSchedules
        .filter(s => s.staffId)
        .map(s => ({
          staffId: s.staffId,
          shiftStart: s.shiftStart,
          shiftEnd: s.shiftEnd,
          shiftType: s.shiftType,
          isRecurring: s.isRecurring,
          recurrenceRule: s.recurrenceRule,
          validFrom: s.validFrom,
          validUntil: s.validUntil,
          notes: s.notes,
        })),
      equipment: formData.equipment
        .filter(e => e.equipmentId)
        .map(e => ({
          equipmentId: e.equipmentId,
          quantity: e.quantity,
        })),
    };

    try {
      await createVehicle.mutateAsync(vehicleData);
      showToast("✅ Véhicule créé avec succès", "success");
      setTimeout(() => router.push(`/vehicles/${companyId}`), 1500);
    } catch (error) {
      showToast(`❌ ${error instanceof Error ? error.message : "Problème de connexion"}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => router.push(`/vehicles/${companyId}`);

  const safeVehicleTypes = Array.isArray(vehicleTypes) ? vehicleTypes : [];
  const safeStaffMembers = Array.isArray(staffMembers) ? staffMembers : [];
  const safeEquipmentList = Array.isArray(equipmentList) ? equipmentList : [];

  return (
    <Toast.Provider>
      <div className="p-6">
        <PageBreadcrumb pageTitle="Ajouter un véhicule" />
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push(`/vehicles/${companyId}`)}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            ← Retour à la liste
          </button>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="text-xl font-semibold text-black dark:text-white">
              Informations du véhicule
            </h3>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-6.5">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Registration */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Immatriculation <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.registration}
                    onChange={(e) => setFormData({ ...formData, registration: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="Ex: CMP1-V001"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Marque
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="Ex: Mercedes"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Modèle
                  </label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="Ex: Sprinter"
                  />
                </div>

                {/* Level */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Niveau d'ambulance <span className="text-danger">*</span>
                  </label>
                  <select
                    required
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value as "BLS" | "ALS" | "ICU" })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    {ambulanceLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    {vehicleStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vehicle Type */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Type de véhicule
                  </label>
                  <select
                    value={formData.vehicleTypeId}
                    onChange={(e) => setFormData({ ...formData, vehicleTypeId: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                  >
                    <option value="">Sélectionner un type</option>
                    {safeVehicleTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Staff Schedules Section */}
              <div className="mt-8 border-t border-stroke pt-6 dark:border-strokedark">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-black dark:text-white">
                    Plannings du personnel
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddStaffSchedule}
                    className="rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 transition-colors"
                  >
                    + Ajouter un planning
                  </button>
                </div>

                {safeStaffMembers.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucun personnel disponible pour cette compagnie.
                  </p>
                )}

                {formData.staffSchedules.map((schedule, index) => (
                  <div key={index} className="mb-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Personnel
                        </label>
                        <select
                          value={schedule.staffId}
                          onChange={(e) => handleStaffScheduleChange(index, "staffId", e.target.value)}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Sélectionner un membre</option>
                          {safeStaffMembers.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                              {staff.matricule} - {staff.firstname} {staff.lastname} ({staff.type})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Type de shift
                        </label>
                        <select
                          value={schedule.shiftType}
                          onChange={(e) => handleStaffScheduleChange(index, "shiftType", e.target.value)}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          {shiftTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Heure de début
                        </label>
                        <input
                          type="datetime-local"
                          value={schedule.shiftStart.slice(0, 16)}
                          onChange={(e) => handleStaffScheduleChange(index, "shiftStart", new Date(e.target.value).toISOString())}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Heure de fin
                        </label>
                        <input
                          type="datetime-local"
                          value={schedule.shiftEnd.slice(0, 16)}
                          onChange={(e) => handleStaffScheduleChange(index, "shiftEnd", new Date(e.target.value).toISOString())}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Notes
                        </label>
                        <input
                          type="text"
                          value={schedule.notes || ""}
                          onChange={(e) => handleStaffScheduleChange(index, "notes", e.target.value)}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                          placeholder="Notes optionnelles"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveStaffSchedule(index)}
                      className="mt-3 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Supprimer ce planning
                    </button>
                  </div>
                ))}
              </div>

              {/* Equipment Section */}
              <div className="mt-8 border-t border-stroke pt-6 dark:border-strokedark">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-black dark:text-white">
                    Équipement
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="rounded-md bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700 transition-colors"
                  >
                    + Ajouter un équipement
                  </button>
                </div>

                {safeEquipmentList.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Aucun équipement disponible pour cette compagnie.
                  </p>
                )}

                {formData.equipment.map((eq, index) => (
                  <div key={index} className="mb-4 rounded-lg border border-stroke p-4 dark:border-strokedark">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Équipement
                        </label>
                        <select
                          value={eq.equipmentId}
                          onChange={(e) => handleEquipmentChange(index, "equipmentId", e.target.value)}
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                        >
                          <option value="">Sélectionner un équipement</option>
                          {safeEquipmentList.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.code} - {item.name} (Disponible: {item.quantity})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                          Quantité
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
                      Supprimer cet équipement
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
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || createVehicle.isPending}
                  className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting || createVehicle.isPending ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block mr-2"></div>
                      Enregistrement...
                    </>
                  ) : (
                    "Enregistrer"
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