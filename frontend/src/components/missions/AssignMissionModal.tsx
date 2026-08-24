// src/components/missions/AssignMissionModal.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAssignMission, useMission, useUnassignVehicle, useCompleteAssignment } from "@/hooks/useMissions";
import { AssignMissionDto, Mission } from "@/types/mission.types";
import { X, Search, Users, Truck, Package, Plus, Trash2, Check, XCircle } from "lucide-react";

// Types
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

interface AssignMissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    mission: Mission | null;
    companyId: string;
    onSuccess?: () => void;
}

// API Functions
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

export default function AssignMissionModal({
    isOpen,
    onClose,
    mission,
    companyId,
    onSuccess,
}: AssignMissionModalProps) {
    const assignMission = useAssignMission();
    const unassignVehicle = useUnassignVehicle();
    const completeAssignment = useCompleteAssignment();

    const { data: missionDetails, refetch: refetchMission, isLoading: isLoadingMission } = useMission(mission?.id || "");

    const [formData, setFormData] = useState<AssignMissionDto>({
        vehicleId: "",
        staffIds: [],
        sourceType: "MANUAL",
        notes: "",
        equipment: [],
    });

    const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
    const [searchStaff, setSearchStaff] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const {
        data: vehicles = [],
        isLoading: vehiclesLoading,
        refetch: refetchVehicles,
    } = useQuery({
        queryKey: ["vehicles", companyId, "available"],
        queryFn: () => fetchVehicles(companyId),
        enabled: isOpen && !!companyId,
    });

    const {
        data: staffMembers = [],
        isLoading: staffLoading,
        refetch: refetchStaff,
    } = useQuery({
        queryKey: ["staffMembers", companyId],
        queryFn: () => fetchStaffMembers(companyId),
        enabled: isOpen && !!companyId,
    });

    const {
        data: equipmentList = [],
        isLoading: equipmentLoading,
        refetch: refetchEquipment,
    } = useQuery({
        queryKey: ["equipment", companyId],
        queryFn: () => fetchEquipment(companyId),
        enabled: isOpen && !!companyId,
    });

    useEffect(() => {
        if (isOpen && missionDetails) {
            refetchVehicles();
            refetchStaff();
            refetchEquipment();
            setError(null);
            setSuccess(null);

            const activeAssignment = missionDetails.assignments?.find((a: any) => !a.isComplete);

            if (activeAssignment) {
                setIsEditing(true);

                setFormData(prev => ({
                    ...prev,
                    vehicleId: activeAssignment.vehicleId,
                    sourceType: activeAssignment.staffMembers?.[0]?.sourceType || "MANUAL",
                    notes: activeAssignment.staffMembers?.[0]?.notes || "",
                }));

                const assignedStaffIds = activeAssignment.staffMembers?.map((s: any) => s.staffId) || [];
                setSelectedStaff(assignedStaffIds);

                const assignedEquipment = missionDetails.equipment?.map((e: any) => ({
                    equipmentId: e.equipmentId,
                    quantity: e.quantity,
                })) || [];

                setFormData(prev => ({
                    ...prev,
                    equipment: assignedEquipment.length > 0 ? assignedEquipment : [{ equipmentId: "", quantity: 1 }],
                }));
            } else {
                setIsEditing(false);
                setFormData({
                    vehicleId: "",
                    staffIds: [],
                    sourceType: "MANUAL",
                    notes: "",
                    equipment: [{ equipmentId: "", quantity: 1 }],
                });
                setSelectedStaff([]);
            }
        }
    }, [isOpen, missionDetails, refetchVehicles, refetchStaff, refetchEquipment]);

    const handleStaffToggle = (staffId: string) => {
        setSelectedStaff(prev => {
            if (prev.includes(staffId)) {
                return prev.filter(id => id !== staffId);
            } else {
                return [...prev, staffId];
            }
        });
    };

    const handleSelectAllStaff = () => {
        if (selectedStaff.length === filteredStaff.length && filteredStaff.length > 0) {
            setSelectedStaff([]);
        } else {
            setSelectedStaff(filteredStaff.map(s => s.id));
        }
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

    const handleUnassignVehicle = async () => {
        const activeAssignment = missionDetails?.assignments?.find((a: any) => !a.isComplete);
        if (!activeAssignment) return;

        if (!confirm("Are you sure you want to unassign this vehicle?")) return;

        try {
            await unassignVehicle.mutateAsync({
                missionId: mission!.id,
                vehicleId: activeAssignment.vehicleId
            });
            setSuccess("✅ Vehicle unassigned successfully");
            refetchMission();
            setIsEditing(false);
            setFormData({
                vehicleId: "",
                staffIds: [],
                sourceType: "MANUAL",
                notes: "",
                equipment: [{ equipmentId: "", quantity: 1 }],
            });
            setSelectedStaff([]);
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError(`❌ ${error instanceof Error ? error.message : "Failed to unassign vehicle"}`);
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleCompleteAssignment = async () => {
        const activeAssignment = missionDetails?.assignments?.find((a: any) => !a.isComplete);
        if (!activeAssignment) return;

        if (!confirm("Mark this assignment as complete?")) return;

        try {
            await completeAssignment.mutateAsync({
                missionId: mission!.id,
                vehicleId: activeAssignment.vehicleId
            });
            setSuccess("✅ Assignment completed successfully");
            refetchMission();
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError(`❌ ${error instanceof Error ? error.message : "Failed to complete assignment"}`);
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        if (!formData.vehicleId) {
            setError("Please select a vehicle");
            setIsSubmitting(false);
            return;
        }

        if (selectedStaff.length === 0) {
            setError("Please select at least one staff member");
            setIsSubmitting(false);
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
            await assignMission.mutateAsync({ id: mission!.id, data });
            setSuccess(isEditing ? "✅ Assignment updated successfully" : "✅ Mission assigned successfully");
            refetchMission();
            if (onSuccess) {
                setTimeout(onSuccess, 500);
            }
            setTimeout(() => {
                setFormData({
                    vehicleId: "",
                    staffIds: [],
                    sourceType: "MANUAL",
                    notes: "",
                    equipment: [{ equipmentId: "", quantity: 1 }],
                });
                setSelectedStaff([]);
                setSearchStaff("");
                setIsSubmitting(false);
                onClose();
            }, 1500);
        } catch (error) {
            setError(`❌ ${error instanceof Error ? error.message : "Connection error"}`);
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            vehicleId: "",
            staffIds: [],
            sourceType: "MANUAL",
            notes: "",
            equipment: [{ equipmentId: "", quantity: 1 }],
        });
        setSelectedStaff([]);
        setSearchStaff("");
        setIsSubmitting(false);
        setError(null);
        setSuccess(null);
        setIsEditing(false);
        onClose();
    };

    const filteredStaff = staffMembers.filter(staff =>
        staff.firstname.toLowerCase().includes(searchStaff.toLowerCase()) ||
        staff.lastname.toLowerCase().includes(searchStaff.toLowerCase()) ||
        staff.matricule.toLowerCase().includes(searchStaff.toLowerCase())
    );

    const isLoading = isLoadingMission || vehiclesLoading || staffLoading || equipmentLoading;

    if (!isOpen) return null;

    const activeAssignment = missionDetails?.assignments?.find((a: any) => !a.isComplete);
    const hasActiveAssignment = !!activeAssignment;

    return (
        <>
            {/* BLACK OVERLAY */}
            <div
                className="fixed inset-0 z-40"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
                onClick={handleClose}
            />

            {/* MODAL */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl" style={{ height: '85vh' }}>
                    {/* HEADER - FIXED */}
                    <div className="flex items-center justify-between border-b px-6 py-4 bg-gray-50 rounded-t-lg" style={{ height: '80px' }}>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {hasActiveAssignment ? 'Edit Mission Assignment' : 'Assign Resources to Mission'}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {mission?.code} - {mission?.reason || "No reason provided"}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasActiveAssignment && (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleCompleteAssignment}
                                        className="rounded-md px-3 py-1.5 text-white text-sm transition-colors flex items-center gap-1"
                                        style={{ backgroundColor: '#16a34a' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                                    >
                                        <Check className="w-4 h-4" />
                                        Complete
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleUnassignVehicle}
                                        className="rounded-md px-3 py-1.5 text-white text-sm transition-colors flex items-center gap-1"
                                        style={{ backgroundColor: '#dc2626' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#b91c1c'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Unassign
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleClose}
                                className="rounded-md p-2 hover:bg-gray-200 transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                    </div>

                    {/* CONTENT - WITH SCROLL */}
                    <div
                        className="p-6"
                        style={{
                            height: 'calc(85vh - 80px)',
                            overflowY: 'auto'
                        }}
                    >
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Current Assignment Info */}
                                {hasActiveAssignment && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                                            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                                            Current Assignment
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <span className="text-gray-600">Vehicle:</span>
                                                <span className="ml-2 font-medium text-gray-900">
                                                    {activeAssignment.vehicle?.registration} - {activeAssignment.vehicle?.brand} {activeAssignment.vehicle?.model}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Staff:</span>
                                                <span className="ml-2 font-medium text-gray-900">
                                                    {activeAssignment.staffMembers?.length || 0} assigned
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Equipment:</span>
                                                <span className="ml-2 font-medium text-gray-900">
                                                    {missionDetails?.equipment?.length || 0} items
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                                            <span>Assigned at: {new Date(activeAssignment.assignedAt).toLocaleString()}</span>
                                            <span className="inline-block w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>Source: {activeAssignment.staffMembers?.[0]?.sourceType || 'N/A'}</span>
                                        </div>
                                        <p className="text-xs text-blue-600 mt-2">
                                            💡 Modify the assignment below and click "Update Assignment" to save changes
                                        </p>
                                    </div>
                                )}

                                {/* Vehicle */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Truck className="inline-block w-4 h-4 mr-1" />
                                        Vehicle <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.vehicleId}
                                        onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <option value="">Select a vehicle</option>
                                        {vehicles.map((v) => (
                                            <option key={v.id} value={v.id}>
                                                {v.registration} - {v.brand || ""} {v.model || ""} ({v.level})
                                            </option>
                                        ))}
                                    </select>
                                    {vehicles.length === 0 && (
                                        <p className="mt-1 text-sm text-yellow-600">⚠️ No available vehicles.</p>
                                    )}
                                </div>

                                {/* Staff */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        <Users className="inline-block w-4 h-4 mr-1" />
                                        Staff Members <span className="text-red-500">*</span>
                                    </label>

                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search staff..."
                                            value={searchStaff}
                                            onChange={(e) => setSearchStaff(e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                                        />
                                    </div>

                                    {filteredStaff.length > 0 && (
                                        <div className="mb-2">
                                            <button
                                                type="button"
                                                onClick={handleSelectAllStaff}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                {selectedStaff.length === filteredStaff.length && filteredStaff.length > 0
                                                    ? "Deselect All"
                                                    : "Select All"}
                                            </button>
                                            <span className="text-sm text-gray-500 ml-2">
                                                ({filteredStaff.length} available)
                                            </span>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 border rounded-lg p-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                                        {filteredStaff.map((staff) => (
                                            <label
                                                key={staff.id}
                                                className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition ${selectedStaff.includes(staff.id)
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStaff.includes(staff.id)}
                                                    onChange={() => handleStaffToggle(staff.id)}
                                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 text-sm truncate">
                                                        {staff.firstname} {staff.lastname}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {staff.matricule} - {staff.type}
                                                    </p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                    {filteredStaff.length === 0 && (
                                        <p className="mt-1 text-sm text-yellow-600">⚠️ No staff members found.</p>
                                    )}
                                    <p className="mt-1 text-sm text-gray-500">
                                        Selected: <span className="font-semibold text-gray-700">{selectedStaff.length}</span>
                                    </p>
                                </div>

                                {/* Source Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Source Type
                                    </label>
                                    <select
                                        value={formData.sourceType}
                                        onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        {sourceTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notes
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                                        placeholder="Additional notes..."
                                    />
                                </div>

                                {/* Equipment */}
                                <div className="border-t pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                            <Package className="w-5 h-5" />
                                            Equipment
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={handleAddEquipment}
                                            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
                                            style={{ backgroundColor: '#2563eb' }}
                                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                                        >
                                            <Plus className="w-4 h-4" />
                                            Add
                                        </button>
                                    </div>

                                    {equipmentList.length === 0 && (
                                        <p className="text-sm text-gray-500">No equipment available.</p>
                                    )}

                                    {formData.equipment?.map((eq, index) => (
                                        <div key={index} className="mb-3 rounded-lg border border-gray-200 p-3 bg-gray-50">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Equipment
                                                    </label>
                                                    <select
                                                        value={eq.equipmentId}
                                                        onChange={(e) => handleEquipmentChange(index, "equipmentId", e.target.value)}
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                                                    >
                                                        <option value="">Select</option>
                                                        {equipmentList.map((item) => (
                                                            <option key={item.id} value={item.id}>
                                                                {item.code} - {item.name} (Avail: {item.quantity})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Quantity
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={eq.quantity}
                                                        onChange={(e) => handleEquipmentChange(index, "quantity", Number(e.target.value))}
                                                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                                    />
                                                </div>

                                                <div className="flex items-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveEquipment(index)}
                                                        className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
                                                        style={{ backgroundColor: '#fef2f2', color: '#dc2626' }}
                                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2' }}
                                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#fef2f2' }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Error/Success Messages */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                        {success}
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || assignMission.isPending}
                                        className="flex-1 rounded-lg px-6 py-2.5 font-medium text-white transition-colors disabled:opacity-50"
                                        style={{ backgroundColor: '#7c3aed' }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#6d28d9'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
                                    >
                                        {isSubmitting || assignMission.isPending ? (
                                            <>
                                                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></span>
                                                {hasActiveAssignment ? 'Updating...' : 'Assigning...'}
                                            </>
                                        ) : (
                                            hasActiveAssignment ? 'Update Assignment' : 'Assign Mission'
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}