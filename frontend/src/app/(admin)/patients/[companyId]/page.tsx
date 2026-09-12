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

// ------------------ Types ------------------
type Patient = {
  id: string;
  firstname: string;
  lastname: string;
  birthDate: string | null;
  phone: string | null;
  gender: string | null;
  address: string | null;
  notes: string | null;
  companyId: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string } | null;
  _count?: { missions: number };
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
const fetchPatients = async ({
  page,
  limit,
  companyId,
  search,
  firstname,
  lastname,
  phone,
  gender,
  address,
  birthDateFrom,
  birthDateTo,
}: {
  page: number;
  limit: number;
  companyId?: string;
  search?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  gender?: string;
  address?: string;
  birthDateFrom?: string;
  birthDateTo?: string;
}): Promise<PaginatedResponse<Patient>> => {
  const params = new URLSearchParams();
  params.append("page", (page + 1).toString());
  params.append("limit", limit.toString());
  if (companyId) params.append("companyId", companyId);
  if (search) params.append("search", search);
  if (firstname) params.append("firstname", firstname);
  if (lastname) params.append("lastname", lastname);
  if (phone) params.append("phone", phone);
  if (gender) params.append("gender", gender);
  if (address) params.append("address", address);
  if (birthDateFrom) params.append("birthDateFrom", birthDateFrom);
  if (birthDateTo) params.append("birthDateTo", birthDateTo);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/patients?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch patients");
  return res.json();
};

// ------------------ Component ------------------
export default function PatientsPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const companyId = params.companyId as string;

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    search: "",
    firstname: "",
    lastname: "",
    phone: "",
    gender: "",
    address: "",
    birthDateFrom: "",
    birthDateTo: "",
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["patients", page, limit, companyId, filters],
    queryFn: () =>
      fetchPatients({
        page,
        limit,
        companyId,
        search: filters.search || undefined,
        firstname: filters.firstname || undefined,
        lastname: filters.lastname || undefined,
        phone: filters.phone || undefined,
        gender: filters.gender || undefined,
        address: filters.address || undefined,
        birthDateFrom: filters.birthDateFrom || undefined,
        birthDateTo: filters.birthDateTo || undefined,
      }),
    placeholderData: keepPreviousData,
    enabled: !!companyId,
  });

  const handleAdd = () => router.push(`/patients/${companyId}/add`);
  const handleEdit = (p: Patient) =>
    router.push(`/patients/${companyId}/edit/${p.id}`);

  const handleDelete = (p: Patient) => {
    setSelectedPatient(p);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPatient) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/${selectedPatient.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Delete failed");
      }
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      showToast(
        `✅ Patient ${selectedPatient.firstname} ${selectedPatient.lastname} deleted`,
        "success"
      );
    } catch (err: any) {
      showToast(`❌ ${err.message || "Failed to delete"}`, "error");
    } finally {
      setDialogOpen(false);
      setSelectedPatient(null);
    }
  };

  const handleSoftDelete = async (p: Patient) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/${p.id}/soft-delete`,
        { method: "PATCH" }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Soft delete failed");
      }
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      showToast(
        `✅ Patient ${p.firstname} ${p.lastname} soft deleted`,
        "success"
      );
    } catch (err: any) {
      showToast(`❌ ${err.message}`, "error");
    }
  };

  const handleRestore = async (p: Patient) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/patients/${p.id}/restore`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Restore failed");
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      showToast(
        `✅ Patient ${p.firstname} ${p.lastname} restored`,
        "success"
      );
    } catch (err) {
      showToast("❌ Failed to restore patient", "error");
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      search: "",
      firstname: "",
      lastname: "",
      phone: "",
      gender: "",
      address: "",
      birthDateFrom: "",
      birthDateTo: "",
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

  const columns: MRT_ColumnDef<Patient>[] = [
    { accessorKey: "firstname", header: "First Name", size: 130 },
    { accessorKey: "lastname", header: "Last Name", size: 130 },
    {
      accessorKey: "birthDate",
      header: "Birth Date",
      size: 120,
      Cell: ({ cell }) => {
        const val = cell.getValue() as string | null;
        return val ? new Date(val).toLocaleDateString() : "—";
      },
    },
    {
      accessorKey: "gender",
      header: "Gender",
      size: 100,
      Cell: ({ cell }) => {
        const g = cell.getValue() as string | null;
        if (!g) return "—";
        const colors: Record<string, string> = {
          MALE: "bg-blue-100 text-blue-800",
          FEMALE: "bg-pink-100 text-pink-800",
          OTHER: "bg-gray-100 text-gray-800",
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${colors[g] || ""}`}>
            {g}
          </span>
        );
      },
    },
    { accessorKey: "phone", header: "Phone", size: 130 },
    { accessorKey: "address", header: "Address", size: 200 },
    {
      accessorKey: "_count.missions",
      header: "Missions",
      size: 90,
      Cell: ({ row }) => (
        <span className="font-semibold">{row.original._count?.missions ?? 0}</span>
      ),
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
      size: 280,
      Cell: ({ row }) => (
        <div className="flex gap-1 flex-wrap">
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
            Patients
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
            Add New Patient
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="First name..."
            value={filters.firstname}
            onChange={(e) => handleFilterChange("firstname", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Last name..."
            value={filters.lastname}
            onChange={(e) => handleFilterChange("lastname", e.target.value)}
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
            value={filters.gender}
            onChange={(e) => handleFilterChange("gender", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Genders</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="text"
            placeholder="Address..."
            value={filters.address}
            onChange={(e) => handleFilterChange("address", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="date"
            placeholder="Birth from"
            value={filters.birthDateFrom}
            onChange={(e) => handleFilterChange("birthDateFrom", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
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
              Selected:{" "}
              <strong>
                {selectedRowData.firstname} {selectedRowData.lastname}
              </strong>
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
          muiToolbarAlertBannerProps={{ sx: { display: "none" } }}
          initialState={{
            pagination: { pageIndex: page, pageSize: limit },
            density: "compact",
          }}
          muiPaginationProps={{ rowsPerPageOptions: [5, 10, 20, 50] }}
        />

        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`px-4 py-2 rounded-md shadow-lg ${toastType === "success" ? "bg-green-600" : "bg-red-600"
            } text-white`}
        >
          <Toast.Title className="font-bold">{toastMsg}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="fixed top-4 right-4 w-96 max-w-full outline-none" />

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
                  {selectedPatient?.firstname} {selectedPatient?.lastname}
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