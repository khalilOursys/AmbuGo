// src/components/missions/AssignMissionForm.tsx
"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import { useAssignMission } from "@/hooks/useMissions";
import { AssignMissionDto } from "@/types/mission.types";

interface Vehicle {
    id: string;
    registration: string;
    brand?: string;
    model?: string;
    level: string;
    status: string;
}

interface StaffMember {
    id: string;
    matricule: string;
    firstname: string;
    lastname: string;
    type: string;
}

interface Equipment {
    id: string;
    code: string;
    name: string;
    quantity: number;
}

interface AssignMissionFormProps {
    missionId: string;
    companyId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

const fetchVehicles = async (companyId?: string): Promise<Vehicle[]> => {
    if (!companyId) return [];
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vehicles?companyId=${companyId}&status=AVAILABLE`);
    if (!response.ok) throw new Error("Failed to fetch vehicles");
    const data = await response.json();
    return Array.isArray(data) ? data : [];
};

const fetchStaffMembers = async (companyId?: string): Promise<StaffMember[]> => {
    if (!companyId) return [];
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff?companyId=${companyId}`);
    if (!response.ok) throw new Error("Failed to fetch staff");
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

const sourceTypes = [
    { value: "SCHEDULE", label: "From Schedule" },
    { value: "MANUAL", label: "Manual Assignment" },
    { value: "REPLACEMENT", label: "Replacement" },
    { value: "EXTRA", label: "Extra" },
];

export default function AssignMissionForm({
    missionId,
    companyId,
    onSuccess,
    onCancel
}: AssignMissionFormProps) {
    const assignMission = useAssignMission();
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");

    const [formData, setFormData] = useState<AssignMissionDto>({
        vehicleId: "",
        staffIds: [],
        sourceType: "MANUAL",
        notes: "",
        equipment: [],
    });

    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);

    // Queries
    const { data: vehicles = [], isLoading: vehiclesLoading } = useQuery({
        queryKey: ["vehicles", companyId, "available"],
        queryFn: () => fetchVehicles(companyId),
        enabled: !!companyId,
    });

    const { data: staffMembers = [], isLoading: staffLoading } = useQuery({
        queryKey: ["staffMembers", companyId],
        queryFn: () => fetchStaffMembers(companyId),
        enabled: !!companyId,
    });

    const { data: equipmentList = [], isLoading: equipmentLoading } = useQuery({
        queryKey: ["equipment", companyId],
        queryFn: () => fetchEquipment(companyId),
        enabled: !!companyId,
    });

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToastMsg(msg);
        setToastType(type);
        setToastOpen(true);
    };

    const handleStaffToggle = (staffId: string) => {
        setSelectedStaff(prev => {
            if (prev.includes(staffId)) {
                return prev.filter(id => id !== staffId);
            } else {
                return [...prev, staffId];
            }
        });
        setFormData(prev => ({ ...prev, staffIds: selectedStaff }));
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.vehicleId) {
            showToast("Please select a vehicle", "error");
            return;
        }

        if (selectedStaff.length === 0) {
            showToast("Please select at least one staff member", "error");
            return;
        }

        const data = {
            ...formData,
            staffIds: selectedStaff,
            equipment: formData.equipment?.filter(e => e.equipmentId).map(e => ({
                equipmentId: e.equipmentId,
                quantity: e.quantity || 1,
            })),
        };

        try {
            await assignMission.mutateAsync({ id: missionId, data });
            showToast("✅ Mission assigned successfully", "success");
            if (onSuccess) {
                setTimeout(onSuccess, 1500);
            }
        } catch (error) {
            showToast(`❌ ${error instanceof Error ? error.message : "Connection error"}`, "error");
        }
    };

    const isLoading = vehiclesLoading || staffLoading || equipmentLoading;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
        );
    }

    return (
        <Toast.Provider>
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
                    <h3 className="text-xl font-semibold text-black dark:text-white">
                        Assign Mission Resources
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Select vehicle, staff, and equipment for this mission
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-6.5">
                        {/* Vehicle Selection */}
                        <div className="mb-6">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Vehicle <span className="text-danger">*</span>
                            </label>
                            <select
                                required
                                value={formData.vehicleId}
                                onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            >
                                <option value="">Select a vehicle</option>
                                {vehicles.map((v) => (
                                    <option key={v.id} value={v.id}>
                                        {v.registration} - {v.brand} {v.model} ({v.level}) - {v.status}
                                    </option>
                                ))}
                            </select>
                            {vehicles.length === 0 && (
                                <p className="mt-2 text-sm text-yellow-600">
                                    No available vehicles. Please add a vehicle first.
                                </p>
                            )}
                        </div>

                        {/* Staff Selection */}
                        <div className="mb-6">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Staff Members <span className="text-danger">*</span>
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {staffMembers.map((staff) => (
                                    <label
                                        key={staff.id}
                                        className={`flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition ${selectedStaff.includes(staff.id)
                                                ? "border-primary bg-primary/5 dark:bg-primary/10"
                                                : "border-stroke hover:border-primary/50 dark:border-strokedark"
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedStaff.includes(staff.id)}
                                            onChange={() => handleStaffToggle(staff.id)}
                                            className="h-4 w-4 accent-primary"
                                        />
                                        <div>
                                            <p className="font-medium text-black dark:text-white">
                                                {staff.firstname} {staff.lastname}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {staff.matricule} - {staff.type}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {staffMembers.length === 0 && (
                                <p className="mt-2 text-sm text-yellow-600">
                                    No staff members available. Please add staff first.
                                </p>
                            )}
                            <p className="mt-2 text-sm text-gray-500">
                                Selected: {selectedStaff.length} staff member(s)
                            </p>
                        </div>

                        {/* Source Type */}
                        <div className="mb-6">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Source Type
                            </label>
                            <select
                                value={formData.sourceType}
                                onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                            >
                                {sourceTypes.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Notes */}
                        <div className="mb-6">
                            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                                Notes
                            </label>
                            <textarea
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                placeholder="Additional notes about this assignment"
                            />
                        </div>

                        {/* Equipment Section */}
                        <div className="mb-6 border-t border-stroke pt-6 dark:border-strokedark">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-semibold text-black dark:text-white">
                                    Equipment
                                </h4>
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
                                    No equipment available.
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
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={onCancel}
                                className="rounded-md border border-stroke px-6 py-3 font-medium hover:bg-gray-100 dark:hover:bg-meta-4 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={assignMission.isPending}
                                className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {assignMission.isPending ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent inline-block mr-2"></div>
                                        Assigning...
                                    </>
                                ) : (
                                    "Assign Mission"
                                )}
                            </button>
                        </div>
                    </div>
                </form>

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