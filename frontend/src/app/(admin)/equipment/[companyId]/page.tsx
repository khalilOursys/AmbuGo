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
import { useRouter, useParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

// ------------------ Types ------------------
type Equipment = {
  id: string;
  code: string;
  name: string;
  description: string;
  quantity: number;
  purchasePrice: number | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  company: {
    id: string;
    name: string;
  };
  vehicleEquipment: Array<{
    vehicle: {
      id: string;
      registration: string;
    };
  }>;
  missionEquipment: Array<{
    mission: {
      id: string;
      code: string;
    };
  }>;
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
const fetchEquipment = async ({
  page,
  limit,
  companyId,
  name,
  code,
  minQuantity,
  maxQuantity,
  isAssigned,
  isDeleted,
}: {
  page: number;
  limit: number;
  companyId?: string;
  name?: string;
  code?: string;
  minQuantity?: number;
  maxQuantity?: number;
  isAssigned?: boolean;
  isDeleted?: boolean;
}): Promise<PaginatedResponse<Equipment>> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (companyId) params.append("companyId", companyId);
  if (name) params.append("name", name);
  if (code) params.append("code", code);
  if (minQuantity !== undefined)
    params.append("minQuantity", minQuantity.toString());
  if (maxQuantity !== undefined)
    params.append("maxQuantity", maxQuantity.toString());
  if (isAssigned !== undefined)
    params.append("isAssigned", isAssigned.toString());
  if (isDeleted !== undefined) params.append("isDeleted", isDeleted.toString());

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/equipment?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch equipment");
  return res.json();
};

// ------------------ Component ------------------
export default function EquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();

  // Get companyId from route params
  const companyId = params.companyId as string;

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    name: "",
    code: "",
    minQuantity: "",
    maxQuantity: "",
    isAssigned: "",
    isDeleted: false,
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null
  );

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["equipment", page, limit, companyId, filters],
    queryFn: () =>
      fetchEquipment({
        page,
        limit,
        companyId: companyId,
        name: filters.name || undefined,
        code: filters.code || undefined,
        minQuantity: filters.minQuantity
          ? parseInt(filters.minQuantity)
          : undefined,
        maxQuantity: filters.maxQuantity
          ? parseInt(filters.maxQuantity)
          : undefined,
        isAssigned:
          filters.isAssigned !== ""
            ? filters.isAssigned === "true"
            : undefined,
        isDeleted: filters.isDeleted,
      }),
    placeholderData: keepPreviousData,
    enabled: !!companyId, // Only run query if companyId exists
  });

  const handleAdd = () => {
    router.push(`/equipment/${companyId}/add`);
  };

  const handleEdit = (equipment: Equipment) => {
    router.push(`/equipment/${companyId}/edit/${equipment.id}`);
  };

  const handleView = (equipment: Equipment) => {
    router.push(`/equipment/view/${companyId}/${equipment.id}`);
  };

  const handleDelete = async (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedEquipment) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/equipment/${selectedEquipment.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");

      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      showToast(`✅ Equipment ${selectedEquipment.name} deleted`, "success");
    } catch (err) {
      showToast("❌ Failed to delete equipment", "error");
    } finally {
      setDialogOpen(false);
      setSelectedEquipment(null);
    }
  };

  const handleSoftDelete = async (equipment: Equipment) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/equipment/${equipment.id}/soft-delete`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Soft delete failed");

      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      showToast(`✅ Equipment ${equipment.name} soft deleted`, "success");
    } catch (err) {
      showToast("❌ Failed to soft delete equipment", "error");
    }
  };

  const handleRestore = async (equipment: Equipment) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/equipment/${equipment.id}/restore`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Restore failed");

      queryClient.invalidateQueries({ queryKey: ["equipment"] });
      showToast(`✅ Equipment ${equipment.name} restored`, "success");
    } catch (err) {
      showToast("❌ Failed to restore equipment", "error");
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      code: "",
      minQuantity: "",
      maxQuantity: "",
      isAssigned: "",
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

  const columns: MRT_ColumnDef<Equipment>[] = [
    { accessorKey: "code", header: "Code", size: 100 },
    { accessorKey: "name", header: "Name", size: 150 },
    { accessorKey: "description", header: "Description", size: 150 },
    {
      accessorKey: "quantity",
      header: "Quantity",
      size: 80,
      Cell: ({ cell }) => {
        const value = cell.getValue() as number;
        return (
          <span
            className={`font-semibold ${value === 0
              ? "text-red-500"
              : value < 5
                ? "text-yellow-500"
                : "text-green-600"
              }`}
          >
            {value}
          </span>
        );
      },
    },
    {
      accessorKey: "purchasePrice",
      header: "Price",
      size: 100,
      Cell: ({ cell }) => {
        const value = cell.getValue();
        return <span>${formatPrice(value)}</span>;
      },
    },
    {
      accessorKey: "company.name",
      header: "Company",
      size: 120,
    },
    {
      accessorKey: "vehicleEquipment",
      header: "Assigned To",
      size: 120,
      Cell: ({ cell }) => {
        const assignments = cell.getValue() as Equipment["vehicleEquipment"];
        return assignments.length > 0 ? (
          <span className="text-green-600">
            {assignments.length} vehicle(s)
          </span>
        ) : (
          <span className="text-gray-400">Not assigned</span>
        );
      },
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
          <button
            className="px-2 py-1 bg-yellow-500 text-white rounded-md text-xs hover:bg-yellow-600"
            onClick={() => handleEdit(row.original)}
          >
            Edit
          </button>
          {row.original.isDeleted ? (
            <button
              className="px-2 py-1 bg-green-500 text-white rounded-md text-xs hover:bg-green-600"
              onClick={() => handleRestore(row.original)}
            >
              Restore
            </button>
          ) : (
            <>
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
        </div>
      ),
    },
  ];

  return (
    <Toast.Provider swipeDirection="right">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">
            Equipment
            {companyId && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (Company ID: {companyId})
              </span>
            )}
          </h1>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add New Equipment
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-8 gap-3">
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Code..."
            value={filters.code}
            onChange={(e) => handleFilterChange("code", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="number"
            placeholder="Min Quantity"
            value={filters.minQuantity}
            onChange={(e) => handleFilterChange("minQuantity", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="number"
            placeholder="Max Quantity"
            value={filters.maxQuantity}
            onChange={(e) => handleFilterChange("maxQuantity", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <select
            value={filters.isAssigned}
            onChange={(e) => handleFilterChange("isAssigned", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Status</option>
            <option value="true">Assigned</option>
            <option value="false">Not Assigned</option>
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
              Selected: <strong>{selectedRowData.name}</strong> (Qty:{" "}
              {selectedRowData.quantity})
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

        {/* Confirm Delete Dialog */}
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
            <Dialog.Content className="fixed top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg z-50">
              <Dialog.Title className="text-lg font-bold">
                Confirm Delete
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-gray-600">
                Are you sure you want to permanently delete{" "}
                <span className="font-semibold">
                  {selectedEquipment?.name ?? ""}
                </span>
                ? This action cannot be undone.
              </Dialog.Description>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </Toast.Provider>
  );
}