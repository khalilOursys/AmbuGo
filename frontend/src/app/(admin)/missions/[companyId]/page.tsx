// src/app/missions/[companyId]/page.tsx
"use client";

import { useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter, useParams } from "next/navigation";
import {
    useMissions,
    useSoftDeleteMission,
    useRestoreMission,
    useDeleteMission
} from "@/hooks/useMissions";
import { Mission, FilterMissionDto } from "@/types/mission.types";
import AssignMissionModal from "@/components/missions/AssignMissionModal";

// Status color mapping
const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        CREATED: "bg-gray-100 text-gray-800",
        ASSIGNED: "bg-blue-100 text-blue-800",
        DISPATCHED: "bg-purple-100 text-purple-800",
        EN_ROUTE: "bg-indigo-100 text-indigo-800",
        ON_SCENE: "bg-yellow-100 text-yellow-800",
        TRANSPORTING: "bg-orange-100 text-orange-800",
        ARRIVED_HOSPITAL: "bg-green-100 text-green-800",
        COMPLETED: "bg-green-600 text-white",
        CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || colors.CREATED;
};

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        CREATED: "Created",
        ASSIGNED: "Assigned",
        DISPATCHED: "Dispatched",
        EN_ROUTE: "En Route",
        ON_SCENE: "On Scene",
        TRANSPORTING: "Transporting",
        ARRIVED_HOSPITAL: "Arrived Hospital",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
    };
    return labels[status] || status;
};

const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
        LOW: "bg-gray-100 text-gray-800",
        NORMAL: "bg-blue-100 text-blue-800",
        HIGH: "bg-yellow-100 text-yellow-800",
        CRITICAL: "bg-red-100 text-red-800",
    };
    return colors[priority] || colors.NORMAL;
};

export default function MissionsPage() {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const companyId = params.companyId as string;

    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(10);
    const [filters, setFilters] = useState<FilterMissionDto>({
        status: undefined,
        priority: undefined,
        search: "",
        fromDate: "",
        toDate: "",
    });

    const [toastOpen, setToastOpen] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState<"success" | "error">("success");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
    const [dialogAction, setDialogAction] = useState<"delete" | "soft-delete" | "restore">("delete");

    // Assign modal state
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [missionToAssign, setMissionToAssign] = useState<Mission | null>(null);

    const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

    const showToast = (msg: string, type: "success" | "error" = "success") => {
        setToastMsg(msg);
        setToastType(type);
        setToastOpen(true);
    };

    const { data, isLoading, isError } = useMissions({
        ...filters,
        companyId,
        page: page + 1,
        limit,
    });

    const softDeleteMutation = useSoftDeleteMission();
    const restoreMutation = useRestoreMission();
    const deleteMutation = useDeleteMission();

    const handleAdd = () => {
        router.push(`/missions/${companyId}/add`);
    };

    const handleAssignClick = (mission: Mission) => {
        setMissionToAssign(mission);
        setAssignModalOpen(true);
    };

    const handleView = (mission: Mission) => {
        router.push(`/missions/${companyId}/${mission.id}`);
    };

    const handleEdit = (mission: Mission) => {
        router.push(`/missions/${companyId}/edit/${mission.id}`);
    };

    const handleSoftDelete = (mission: Mission) => {
        setSelectedMission(mission);
        setDialogAction("soft-delete");
        setDialogOpen(true);
    };

    const handleRestore = (mission: Mission) => {
        setSelectedMission(mission);
        setDialogAction("restore");
        setDialogOpen(true);
    };

    const handleDelete = (mission: Mission) => {
        setSelectedMission(mission);
        setDialogAction("delete");
        setDialogOpen(true);
    };

    const confirmAction = async () => {
        if (!selectedMission) return;

        try {
            let successMsg = "";
            if (dialogAction === "soft-delete") {
                await softDeleteMutation.mutateAsync(selectedMission.id);
                successMsg = `✅ Mission ${selectedMission.code} soft deleted`;
            } else if (dialogAction === "restore") {
                await restoreMutation.mutateAsync(selectedMission.id);
                successMsg = `✅ Mission ${selectedMission.code} restored`;
            } else {
                await deleteMutation.mutateAsync(selectedMission.id);
                successMsg = `✅ Mission ${selectedMission.code} permanently deleted`;
            }
            showToast(successMsg, "success");
        } catch (err) {
            showToast(`❌ Failed to ${dialogAction} mission`, "error");
        } finally {
            setDialogOpen(false);
            setSelectedMission(null);
        }
    };

    const handleFilterChange = (key: string, value: any) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(0);
    };

    const handleClearFilters = () => {
        setFilters({
            status: undefined,
            priority: undefined,
            search: "",
            fromDate: "",
            toDate: "",
        });
        setPage(0);
    };

    const handlePaginationChange = (updater: any) => {
        const newState = typeof updater === "function"
            ? updater({ pageIndex: page, pageSize: limit })
            : updater;
        setPage(newState.pageIndex);
        setLimit(newState.pageSize);
    };

    const statusOptions = [
        { value: "", label: "All Statuses" },
        { value: "CREATED", label: "Created" },
        { value: "ASSIGNED", label: "Assigned" },
        { value: "DISPATCHED", label: "Dispatched" },
        { value: "EN_ROUTE", label: "En Route" },
        { value: "ON_SCENE", label: "On Scene" },
        { value: "TRANSPORTING", label: "Transporting" },
        { value: "ARRIVED_HOSPITAL", label: "Arrived Hospital" },
        { value: "COMPLETED", label: "Completed" },
        { value: "CANCELLED", label: "Cancelled" },
    ];

    const priorityOptions = [
        { value: "", label: "All Priorities" },
        { value: "LOW", label: "Low" },
        { value: "NORMAL", label: "Normal" },
        { value: "HIGH", label: "High" },
        { value: "CRITICAL", label: "Critical" },
    ];

    const columns: MRT_ColumnDef<Mission>[] = [
        {
            accessorKey: "code",
            header: "Code",
            size: 120,
        },
        {
            accessorKey: "priority",
            header: "Priority",
            size: 100,
            Cell: ({ cell }) => {
                const priority = cell.getValue<string>();
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(priority)}`}>
                        {priority}
                    </span>
                );
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            size: 130,
            Cell: ({ cell }) => {
                const status = cell.getValue<string>();
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {getStatusLabel(status)}
                    </span>
                );
            },
        },
        {
            accessorKey: "customer.name",
            header: "Customer",
            size: 150,
            Cell: ({ cell }) => cell.getValue<string>() || "-",
        },
        {
            accessorKey: "patient",
            header: "Patient",
            size: 150,
            Cell: ({ row }) => {
                const patient = row.original.patient;
                return patient ? `${patient.firstname} ${patient.lastname}` : "-";
            },
        },
        {
            accessorKey: "callDate",
            header: "Call Date",
            size: 150,
            Cell: ({ cell }) => {
                const date = cell.getValue<string>();
                return date ? new Date(date).toLocaleString() : "-";
            },
        },
        {
            accessorKey: "assignments",
            header: "Assigned",
            size: 80,
            Cell: ({ row }) => {
                const assignments = row.original.assignments?.filter(a => !a.isComplete) || [];
                return assignments.length > 0 ? (
                    <span className="text-green-600">✓ {assignments.length}</span>
                ) : (
                    <span className="text-gray-400">✗</span>
                );
            },
        },
        {
            id: "actions",
            header: "Actions",
            size: 320,
            Cell: ({ row }) => (
                <div className="flex gap-1 flex-wrap">
                    <button
                        className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600"
                        onClick={() => handleView(row.original)}
                    >
                        View
                    </button>
                    {!row.original.isDeleted && (
                        <button
                            className="px-2 py-1 bg-purple-500 text-white rounded-md text-xs hover:bg-purple-600 flex items-center gap-1"
                            onClick={() => handleAssignClick(row.original)}
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Assign
                        </button>
                    )}
                    {!row.original.isDeleted && (
                        <>
                            <button
                                className="px-2 py-1 bg-yellow-500 text-white rounded-md text-xs hover:bg-yellow-600"
                                onClick={() => handleEdit(row.original)}
                            >
                                Edit
                            </button>
                            <button
                                className="px-2 py-1 bg-orange-500 text-white rounded-md text-xs hover:bg-orange-600"
                                onClick={() => handleSoftDelete(row.original)}
                            >
                                Soft Delete
                            </button>
                            <button
                                className="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
                                onClick={() => handleDelete(row.original)}
                            >
                                Delete
                            </button>
                        </>
                    )}
                    {row.original.isDeleted && (
                        <button
                            className="px-2 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600"
                            onClick={() => handleRestore(row.original)}
                        >
                            Restore
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <Toast.Provider swipeDirection="right">
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-bold">
                        Missions
                        <span className="text-sm font-normal text-gray-500 ml-2">
                            (Company: {companyId})
                        </span>
                    </h1>
                    <button
                        onClick={handleAdd}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                        Create Mission
                    </button>
                </div>

                {/* Filters */}
                <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
                    <input
                        type="text"
                        placeholder="Search by code, reason, address..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange("search", e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                    />
                    <select
                        value={filters.status || ""}
                        onChange={(e) => handleFilterChange("status", e.target.value || undefined)}
                        className="px-3 py-2 border rounded-md text-sm"
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.priority || ""}
                        onChange={(e) => handleFilterChange("priority", e.target.value || undefined)}
                        className="px-3 py-2 border rounded-md text-sm"
                    >
                        {priorityOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        value={filters.fromDate}
                        onChange={(e) => handleFilterChange("fromDate", e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                        placeholder="From Date"
                    />
                    <input
                        type="date"
                        value={filters.toDate}
                        onChange={(e) => handleFilterChange("toDate", e.target.value)}
                        className="px-3 py-2 border rounded-md text-sm"
                        placeholder="To Date"
                    />
                    <button
                        onClick={handleClearFilters}
                        className="px-3 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
                    >
                        Clear Filters
                    </button>
                </div>

                <MaterialReactTable
                    columns={columns}
                    data={data?.data ?? []}
                    state={{
                        isLoading,
                        pagination: { pageIndex: page, pageSize: limit },
                    }}
                    manualPagination
                    rowCount={data?.meta.total ?? 0}
                    onPaginationChange={handlePaginationChange}
                    enableToolbarInternalActions={false}
                    onRowSelectionChange={setRowSelection}
                    muiToolbarAlertBannerProps={{
                        sx: { display: "none" },
                    }}
                    initialState={{
                        pagination: { pageIndex: page, pageSize: limit },
                        density: "compact",
                    }}
                    muiPaginationProps={{
                        rowsPerPageOptions: [5, 10, 20, 50],
                    }}
                />

                <Toast.Root
                    open={toastOpen}
                    onOpenChange={setToastOpen}
                    className={`px-4 py-2 rounded-md shadow-lg ${toastType === "success" ? "bg-green-600" : "bg-red-600"} text-white`}
                >
                    <Toast.Title className="font-bold">{toastMsg}</Toast.Title>
                </Toast.Root>
                <Toast.Viewport className="fixed top-4 right-4 w-96 max-w-full outline-none" />

                {/* Delete/Restore Dialog */}
                <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
                    <Dialog.Portal>
                        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
                        <Dialog.Content className="fixed top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg z-50">
                            <Dialog.Title className="text-lg font-bold">
                                {dialogAction === "restore" ? "Restore Mission" :
                                    dialogAction === "soft-delete" ? "Soft Delete Mission" :
                                        "Confirm Delete"}
                            </Dialog.Title>
                            <Dialog.Description className="mt-2 text-gray-600">
                                {dialogAction === "restore" ? (
                                    <>Are you sure you want to restore <span className="font-semibold">{selectedMission?.code}</span>?</>
                                ) : dialogAction === "soft-delete" ? (
                                    <>Are you sure you want to soft delete <span className="font-semibold">{selectedMission?.code}</span>? This can be restored later.</>
                                ) : (
                                    <>Are you sure you want to permanently delete <span className="font-semibold">{selectedMission?.code}</span>? This action cannot be undone.</>
                                )}
                            </Dialog.Description>
                            <div className="mt-4 flex justify-end gap-2">
                                <button
                                    onClick={() => setDialogOpen(false)}
                                    className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmAction}
                                    className={`px-4 py-2 rounded-md text-white ${dialogAction === "restore"
                                        ? "bg-green-500 hover:bg-green-600"
                                        : dialogAction === "soft-delete"
                                            ? "bg-orange-500 hover:bg-orange-600"
                                            : "bg-red-500 hover:bg-red-600"
                                        }`}
                                >
                                    {dialogAction === "restore" ? "Restore" :
                                        dialogAction === "soft-delete" ? "Soft Delete" :
                                            "Delete"}
                                </button>
                            </div>
                        </Dialog.Content>
                    </Dialog.Portal>
                </Dialog.Root>

                {/* Assign Mission Modal */}
                <AssignMissionModal
                    isOpen={assignModalOpen}
                    onClose={() => setAssignModalOpen(false)}
                    mission={missionToAssign}
                    companyId={companyId}
                    onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ["missions", companyId] });
                        showToast("✅ Mission assigned successfully", "success");
                        setAssignModalOpen(false);
                    }}
                />
            </div>
        </Toast.Provider>
    );
}