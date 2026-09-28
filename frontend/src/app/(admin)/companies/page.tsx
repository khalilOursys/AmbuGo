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
  const [dialogAction, setDialogAction] = useState<"delete" | "restore">("delete");
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

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setDialogAction("delete");
    setDialogOpen(true);
  };

  const handleRestore = (company: Company) => {
    setSelectedCompany(company);
    setDialogAction("restore");
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedCompany) return;

    try {
      const url =
        dialogAction === "delete"
          ? `${process.env.NEXT_PUBLIC_API_URL}/companies/${selectedCompany.id}/soft-delete`
          : `${process.env.NEXT_PUBLIC_API_URL}/companies/${selectedCompany.id}/restore`;

      const res = await fetch(url, { method: "PATCH" });
      if (!res.ok) throw new Error("Action failed");

      queryClient.invalidateQueries({ queryKey: ["companies"] });
      showToast(
        dialogAction === "delete"
          ? `✅ Company ${selectedCompany.name} deleted`
          : `✅ Company ${selectedCompany.name} restored`,
        "success"
      );
    } catch (err) {
      showToast(
        dialogAction === "delete"
          ? "❌ Failed to delete company"
          : "❌ Failed to restore company",
        "error"
      );
    } finally {
      setDialogOpen(false);
      setSelectedCompany(null);
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
      accessorKey: "isDeleted",
      header: "Status",
      size: 90,
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
            <button
              className="px-2 py-1 bg-red-500 text-white rounded-md text-xs hover:bg-red-600"
              onClick={() => handleDelete(row.original)}
            >
              Delete
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
            pagination: { pageIndex: page, pageSize: limit },
          }}
          manualPagination
          rowCount={data?.meta.total ?? 0}
          onPaginationChange={handlePaginationChange}
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

        {/* Confirm Dialog */}
        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-2xl z-50">
              <Dialog.Title className="text-lg font-bold">
                {dialogAction === "delete" ? "Confirm Delete" : "Confirm Restore"}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-gray-600">
                {dialogAction === "delete" ? (
                  <>
                    Are you sure you want to delete{" "}
                    <span className="font-semibold">
                      {selectedCompany?.name ?? ""}
                    </span>
                    ? The company can be restored later.
                  </>
                ) : (
                  <>
                    Are you sure you want to restore{" "}
                    <span className="font-semibold">
                      {selectedCompany?.name ?? ""}
                    </span>
                    ?
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
                  className={`px-4 py-2 rounded-md text-white ${dialogAction === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                    }`}
                >
                  {dialogAction === "delete" ? "Delete" : "Restore"}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </Toast.Provider>
  );
}