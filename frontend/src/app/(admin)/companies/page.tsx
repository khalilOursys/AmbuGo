// app/admin/companies/page.tsx
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
type Company = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  pricingType: string;
  baseCurrency: string;
  matriculeFiscale: string;
  rib: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  _count: {
    users: number;
    vehicles: number;
    equipment: number;
    services: number;
    staff: number;
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
const fetchCompanies = async ({
  page,
  limit,
  name,
  email,
  phone,
  pricingType,
  isDeleted,
}: {
  page: number;
  limit: number;
  name?: string;
  email?: string;
  phone?: string;
  pricingType?: string;
  isDeleted?: boolean;
}): Promise<PaginatedResponse<Company>> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (name) params.append("name", name);
  if (email) params.append("email", email);
  if (phone) params.append("phone", phone);
  if (pricingType) params.append("pricingType", pricingType);
  if (isDeleted !== undefined) params.append("isDeleted", isDeleted.toString());

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/companies?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch companies");
  return res.json();
};

// ------------------ Component ------------------
export default function CompaniesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    phone: "",
    pricingType: "",
    isDeleted: false,
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ["companies", page, limit, filters],
    queryFn: () =>
      fetchCompanies({
        page,
        limit,
        name: filters.name || undefined,
        email: filters.email || undefined,
        phone: filters.phone || undefined,
        pricingType: filters.pricingType || undefined,
        isDeleted: filters.isDeleted,
      }),
    placeholderData: keepPreviousData,
  });

  const handleAdd = () => {
    router.push("/admin/companies/add");
  };

  const handleEdit = (company: Company) => {
    router.push(`/admin/companies/edit/${company.id}`);
  };

  const handleView = (company: Company) => {
    router.push(`/admin/companies/${company.id}`);
  };

  const handleDelete = async (company: Company) => {
    setSelectedCompany(company);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedCompany) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${selectedCompany.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");

      queryClient.invalidateQueries({ queryKey: ["companies"] });
      showToast(`✅ Company ${selectedCompany.name} deleted`, "success");
    } catch (err) {
      showToast("❌ Failed to delete company", "error");
    } finally {
      setDialogOpen(false);
      setSelectedCompany(null);
    }
  };

  const handleSoftDelete = async (company: Company) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${company.id}/soft-delete`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Soft delete failed");

      queryClient.invalidateQueries({ queryKey: ["companies"] });
      showToast(`✅ Company ${company.name} soft deleted`, "success");
    } catch (err) {
      showToast("❌ Failed to soft delete company", "error");
    }
  };

  const handleRestore = async (company: Company) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/${company.id}/restore`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Restore failed");

      queryClient.invalidateQueries({ queryKey: ["companies"] });
      showToast(`✅ Company ${company.name} restored`, "success");
    } catch (err) {
      showToast("❌ Failed to restore company", "error");
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      name: "",
      email: "",
      phone: "",
      pricingType: "",
      isDeleted: false,
    });
    setPage(0);
  };

  // Fixed pagination handler
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

  const columns: MRT_ColumnDef<Company>[] = [
    { accessorKey: "name", header: "Name", size: 150 },
    { accessorKey: "email", header: "Email", size: 150 },
    { accessorKey: "phone", header: "Phone", size: 120 },
    { accessorKey: "address", header: "Address", size: 150 },
    {
      accessorKey: "pricingType",
      header: "Pricing",
      size: 100,
      Cell: ({ cell }) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
          {cell.getValue() as string}
        </span>
      ),
    },
    {
      accessorKey: "_count",
      header: "Stats",
      size: 120,
      Cell: ({ cell }) => {
        const counts = cell.getValue() as Company["_count"];
        return (
          <div className="text-xs">
            <div>🚗 {counts.vehicles}</div>
            <div>👤 {counts.users}</div>
            <div>📦 {counts.equipment}</div>
          </div>
        );
      },
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
          <h1 className="text-2xl font-bold">Companies</h1>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add New Company
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => handleFilterChange("name", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Email..."
            value={filters.email}
            onChange={(e) => handleFilterChange("email", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Phone..."
            value={filters.phone}
            onChange={(e) => handleFilterChange("phone", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <select
            value={filters.pricingType}
            onChange={(e) => handleFilterChange("pricingType", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Pricing</option>
            <option value="FIXED">Fixed</option>
            <option value="PER_KM">Per KM</option>
            <option value="DISTANCE_RANGE">Distance Range</option>
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
              Selected: <strong>{selectedRowData.name}</strong>
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
            rowSelection,
            pagination: { pageIndex: page, pageSize: limit }, // ✅ Added
          }}
          manualPagination
          rowCount={data?.meta.total ?? 0}
          onPaginationChange={handlePaginationChange} // ✅ Fixed handler
          enableToolbarInternalActions={false}
          onRowSelectionChange={handleRowSelectionChange}
          enableMultiRowSelection={false}
          enableSelectAll={false}
          muiToolbarAlertBannerProps={{
            sx: { display: "none" },
          }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: () => {
              setRowSelection({ [row.id]: true });
            },
            sx: {
              cursor: "pointer",
              backgroundColor: row.getIsSelected()
                ? "rgba(0, 0, 0, 0.04)"
                : "inherit",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.02)",
              },
            },
          })}
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
                  {selectedCompany?.name ?? ""}
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