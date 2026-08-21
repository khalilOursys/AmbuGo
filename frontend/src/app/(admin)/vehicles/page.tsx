// src/app/vehicles/page.tsx
"use client";

import { useState } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";

// ------------------ Types ------------------
type Vehicle = {
  id: string;
  registration: string;
  brand: string;
  model: string;
  level: 'BLS' | 'ALS' | 'ICU';
  status: 'AVAILABLE' | 'ASSIGNED' | 'BUSY' | 'MAINTENANCE' | 'OFFLINE';
  companyId: string;
  vehicleTypeId: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
  };
  vehicleType: {
    id: string;
    name: string;
  };
  _count?: {
    assignments: number;
    staffSchedules: number;
  };
};

type PaginatedResponse<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  filters: Record<string, any>;
};

type PaginationState = { pageIndex: number; pageSize: number };

// ------------------ Fetcher ------------------
const fetchVehicles = async ({
  page,
  limit,
  companyId,
  registration,
  brand,
  model,
  status,
  level,
  isDeleted,
}: {
  page: number;
  limit: number;
  companyId?: string;
  registration?: string;
  brand?: string;
  model?: string;
  status?: string;
  level?: string;
  isDeleted?: boolean;
}): Promise<PaginatedResponse<Vehicle>> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (companyId) params.append("companyId", companyId);
  if (registration) params.append("registration", registration);
  if (brand) params.append("brand", brand);
  if (model) params.append("model", model);
  if (status) params.append("status", status);
  if (level) params.append("level", level);
  if (isDeleted !== undefined) params.append("isDeleted", isDeleted.toString());

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/vehicles?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  return res.json();
};

// ------------------ Component ------------------
export default function VehiclesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    registration: "",
    brand: "",
    model: "",
    status: "",
    level: "",
    isDeleted: false,
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [dialogAction, setDialogAction] = useState<"delete" | "soft-delete" | "restore">("delete");

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["vehicles", page, limit, filters],
    queryFn: () =>
      fetchVehicles({
        page,
        limit,
        registration: filters.registration || undefined,
        brand: filters.brand || undefined,
        model: filters.model || undefined,
        status: filters.status || undefined,
        level: filters.level || undefined,
        isDeleted: filters.isDeleted,
      }),
    placeholderData: keepPreviousData,
  });

  const handleAdd = () => {
    router.push(`/vehicles/add`);
  };

  const handleEdit = (vehicle: Vehicle) => {
    router.push(`/vehicles/edit/${vehicle.id}`);
  };

  const handleView = (vehicle: Vehicle) => {
    router.push(`/vehicles/${vehicle.id}`);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogAction("delete");
    setDialogOpen(true);
  };

  const handleSoftDelete = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogAction("soft-delete");
    setDialogOpen(true);
  };

  const handleRestore = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setDialogAction("restore");
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedVehicle) return;

    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/vehicles/${selectedVehicle.id}`;
      let method = "DELETE";
      let successMsg = "";

      if (dialogAction === "soft-delete") {
        url = `${url}/soft-delete`;
        method = "PATCH";
        successMsg = `✅ Vehicle ${selectedVehicle.registration} soft deleted`;
      } else if (dialogAction === "restore") {
        url = `${url}/restore`;
        method = "PATCH";
        successMsg = `✅ Vehicle ${selectedVehicle.registration} restored`;
      } else {
        successMsg = `✅ Vehicle ${selectedVehicle.registration} permanently deleted`;
      }

      const res = await fetch(url, { method });
      if (!res.ok) throw new Error("Action failed");

      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      showToast(successMsg, "success");
    } catch (err) {
      showToast(`❌ Failed to ${dialogAction} vehicle`, "error");
    } finally {
      setDialogOpen(false);
      setSelectedVehicle(null);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      registration: "",
      brand: "",
      model: "",
      status: "",
      level: "",
      isDeleted: false,
    });
    setPage(0);
  };

  const handlePaginationChange = (updater: any) => {
    const newState: PaginationState =
      typeof updater === "function"
        ? updater({ pageIndex: page, pageSize: limit })
        : updater;
    setPage(newState.pageIndex);
    setLimit(newState.pageSize);
  };

  const handleRowSelectionChange = (updater: any) => {
    const newSelection =
      typeof updater === "function" ? updater(rowSelection) : updater;
    const selectedKeys = Object.keys(newSelection).filter(
      (key) => newSelection[key]
    );

    if (selectedKeys.length > 1) {
      const lastSelectedKey = selectedKeys[selectedKeys.length - 1];
      setRowSelection({ [lastSelectedKey]: true });
    } else {
      setRowSelection(newSelection);
    }
  };

  const selectedRowKey = Object.keys(rowSelection).find(
    (key) => rowSelection[key]
  );
  const selectedRowData = selectedRowKey
    ? data?.data[parseInt(selectedRowKey)]
    : null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: "bg-green-100 text-green-800",
      ASSIGNED: "bg-blue-100 text-blue-800",
      BUSY: "bg-red-100 text-red-800",
      MAINTENANCE: "bg-yellow-100 text-yellow-800",
      OFFLINE: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.OFFLINE;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      AVAILABLE: "Available",
      ASSIGNED: "Assigned",
      BUSY: "Busy",
      MAINTENANCE: "Maintenance",
      OFFLINE: "Offline",
    };
    return labels[status] || status;
  };

  const columns: MRT_ColumnDef<Vehicle>[] = [
    {
      accessorKey: "registration",
      header: "Registration",
      size: 120,
    },
    {
      accessorKey: "brand",
      header: "Brand",
      size: 100,
      Cell: ({ cell }) => cell.getValue<string>() || "-",
    },
    {
      accessorKey: "model",
      header: "Model",
      size: 100,
      Cell: ({ cell }) => cell.getValue<string>() || "-",
    },
    {
      accessorKey: "level",
      header: "Level",
      size: 80,
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 120,
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
      accessorKey: "company.name",
      header: "Company",
      size: 120,
    },
    {
      accessorKey: "vehicleType.name",
      header: "Type",
      size: 120,
      Cell: ({ cell }) => cell.getValue<string>() || "-",
    },
    {
      accessorKey: "isDeleted",
      header: "Status",
      size: 80,
      Cell: ({ cell }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${cell.getValue()
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
            }`}
        >
          {cell.getValue() ? "Deleted" : "Active"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      size: 250,
      Cell: ({ row }) => (
        <div className="flex gap-1 flex-wrap">
          <button
            className="px-2 py-1 bg-blue-500 text-white rounded-md text-xs hover:bg-blue-600"
            onClick={() => handleView(row.original)}
          >
            View
          </button>
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

  // Status options for filter
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "AVAILABLE", label: "Available" },
    { value: "ASSIGNED", label: "Assigned" },
    { value: "BUSY", label: "Busy" },
    { value: "MAINTENANCE", label: "Maintenance" },
    { value: "OFFLINE", label: "Offline" },
  ];

  const levelOptions = [
    { value: "", label: "All Levels" },
    { value: "BLS", label: "BLS" },
    { value: "ALS", label: "ALS" },
    { value: "ICU", label: "ICU" },
  ];

  return (
    <Toast.Provider swipeDirection="right">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Vehicles</h1>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add New Vehicle
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-7 gap-3">
          <input
            type="text"
            placeholder="Registration..."
            value={filters.registration}
            onChange={(e) => handleFilterChange("registration", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Brand..."
            value={filters.brand}
            onChange={(e) => handleFilterChange("brand", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Model..."
            value={filters.model}
            onChange={(e) => handleFilterChange("model", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={filters.level}
            onChange={(e) => handleFilterChange("level", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            {levelOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={filters.isDeleted.toString()}
            onChange={(e) =>
              handleFilterChange("isDeleted", e.target.value === "true")
            }
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="false">Active Only</option>
            <option value="true">Deleted Only</option>
          </select>
          <button
            onClick={handleClearFilters}
            className="px-3 py-2 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
          >
            Clear Filters
          </button>
        </div>

        {selectedRowData && (
          <div className="mb-4 flex gap-2 items-center p-3 bg-gray-100 rounded-md">
            <span className="text-sm text-gray-600">
              Selected: <strong>{selectedRowData.registration}</strong>
              {selectedRowData.brand && ` - ${selectedRowData.brand} ${selectedRowData.model || ''}`}
            </span>
            <button
              onClick={() => setRowSelection({})}
              className="px-3 py-1 bg-gray-500 text-white rounded-md text-sm hover:bg-gray-600"
            >
              Clear Selection
            </button>
          </div>
        )}

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
          onRowSelectionChange={handleRowSelectionChange}
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

        {/* Toast */}
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`px-4 py-2 rounded-md shadow-lg ${toastType === "success" ? "bg-green-600" : "bg-red-600"
            } text-white`}
        >
          <Toast.Title className="font-bold">{toastMsg}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="fixed top-4 right-4 w-96 max-w-full outline-none" />

        {/* Confirm Dialog */}
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg z-50">
              <Dialog.Title className="text-lg font-bold">
                {dialogAction === "restore" ? "Restore Vehicle" :
                  dialogAction === "soft-delete" ? "Soft Delete Vehicle" :
                    "Confirm Delete"}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-gray-600">
                {dialogAction === "restore" ? (
                  <>
                    Are you sure you want to restore{" "}
                    <span className="font-semibold">
                      {selectedVehicle?.registration ?? ""}
                    </span>
                    ?
                  </>
                ) : dialogAction === "soft-delete" ? (
                  <>
                    Are you sure you want to soft delete{" "}
                    <span className="font-semibold">
                      {selectedVehicle?.registration ?? ""}
                    </span>
                    ? This can be restored later.
                  </>
                ) : (
                  <>
                    Are you sure you want to permanently delete{" "}
                    <span className="font-semibold">
                      {selectedVehicle?.registration ?? ""}
                    </span>
                    ? This action cannot be undone.
                  </>
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
      </div>
    </Toast.Provider>
  );
}