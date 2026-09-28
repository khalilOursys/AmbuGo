// app/staff/[companyId]/page.tsx
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
type Staff = {
  id: string;
  matricule: string | null;
  firstname: string;
  lastname: string;
  phone: string | null;
  email: string | null;
  type: string;
  userId: string | null;
  companyId: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    telephone: string | null;
  } | null;
  company: { id: string; name: string } | null;
  _count?: { assignmentStaff: number };
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
const fetchStaff = async ({
  page,
  limit,
  companyId,
  firstname,
  lastname,
  type,
  phone,
  email,
  matricule,
  search,
  isDeleted,
}: {
  page: number;
  limit: number;
  companyId?: string;
  firstname?: string;
  lastname?: string;
  type?: string;
  phone?: string;
  email?: string;
  matricule?: string;
  search?: string;
  isDeleted?: boolean;
}): Promise<PaginatedResponse<Staff>> => {
  const params = new URLSearchParams();
  params.append("page", (page + 1).toString());
  params.append("limit", limit.toString());
  if (companyId) params.append("companyId", companyId);
  if (firstname) params.append("firstname", firstname);
  if (lastname) params.append("lastname", lastname);
  if (type) params.append("type", type);
  if (phone) params.append("phone", phone);
  if (email) params.append("email", email);
  if (matricule) params.append("matricule", matricule);
  if (search) params.append("search", search);
  if (isDeleted !== undefined) params.append("isDeleted", isDeleted.toString());

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/staff?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch staff");
  return res.json();
};

// ------------------ Component ------------------
export default function StaffPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();

  const companyId = params.companyId as string;

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    firstname: "",
    lastname: "",
    type: "",
    phone: "",
    email: "",
    matricule: "",
    search: "",
    isDeleted: false,
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"delete" | "restore">("delete");
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["staff", page, limit, companyId, filters],
    queryFn: () =>
      fetchStaff({
        page,
        limit,
        companyId,
        firstname: filters.firstname || undefined,
        lastname: filters.lastname || undefined,
        type: filters.type || undefined,
        phone: filters.phone || undefined,
        email: filters.email || undefined,
        matricule: filters.matricule || undefined,
        search: filters.search || undefined,
        isDeleted: filters.isDeleted,
      }),
    placeholderData: keepPreviousData,
    enabled: !!companyId,
  });

  const handleAdd = () => router.push(`/staff/${companyId}/add`);
  const handleEdit = (staff: Staff) =>
    router.push(`/staff/${companyId}/edit/${staff.id}`);
  const handleView = (staff: Staff) =>
    router.push(`/staff/${companyId}/view/${staff.id}`);

  const handleDelete = (staff: Staff) => {
    setSelectedStaff(staff);
    setDialogAction("delete");
    setDialogOpen(true);
  };

  const handleRestore = (staff: Staff) => {
    setSelectedStaff(staff);
    setDialogAction("restore");
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedStaff) return;
    try {
      const url =
        dialogAction === "delete"
          ? `${process.env.NEXT_PUBLIC_API_URL}/staff/${selectedStaff.id}/soft-delete`
          : `${process.env.NEXT_PUBLIC_API_URL}/staff/${selectedStaff.id}/restore`;

      const res = await fetch(url, { method: "PATCH" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Action failed");
      }
      queryClient.invalidateQueries({ queryKey: ["staff"] });

      const fullName = `${selectedStaff.firstname} ${selectedStaff.lastname}`;
      showToast(
        dialogAction === "delete"
          ? `✅ Staff ${fullName} deleted`
          : `✅ Staff ${fullName} restored`,
        "success"
      );
    } catch (err: any) {
      showToast(`❌ ${err.message || "Action failed"}`, "error");
    } finally {
      setDialogOpen(false);
      setSelectedStaff(null);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      firstname: "",
      lastname: "",
      type: "",
      phone: "",
      email: "",
      matricule: "",
      search: "",
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

  const columns: MRT_ColumnDef<Staff>[] = [
    {
      accessorKey: "matricule",
      header: "Matricule",
      size: 120,
      Cell: ({ cell }) => (
        <span className="font-mono text-sm">
          {(cell.getValue() as string) || "—"}
        </span>
      ),
    },
    {
      id: "fullname",
      header: "Name",
      size: 180,
      Cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.firstname} {row.original.lastname}
          </div>
          {row.original.user && (
            <div className="text-xs text-gray-500">
              User: {row.original.user.email}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      size: 130,
      Cell: ({ cell }) => {
        const type = cell.getValue() as string;
        const colors: Record<string, string> = {
          DRIVER: "bg-blue-100 text-blue-800",
          NURSE: "bg-green-100 text-green-800",
          DOCTOR: "bg-purple-100 text-purple-800",
          PARAMEDIC: "bg-orange-100 text-orange-800",
          ADMIN: "bg-gray-100 text-gray-800",
          OTHER: "bg-gray-100 text-gray-800",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs ${colors[type] || colors.OTHER}`}
          >
            {type}
          </span>
        );
      },
    },
    { accessorKey: "phone", header: "Phone", size: 130 },
    { accessorKey: "email", header: "Email", size: 180 },
    {
      accessorKey: "_count.assignmentStaff",
      header: "Assignments",
      size: 110,
      Cell: ({ row }) => (
        <span className="font-semibold">
          {row.original._count?.assignmentStaff ?? 0}
        </span>
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
      size: 320,
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
          <h1 className="text-2xl font-bold">
            Staff Members
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
            Add New Staff
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-9 gap-3">
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
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Types</option>
            <option value="DRIVER">Driver</option>
            <option value="NURSE">Nurse</option>
            <option value="DOCTOR">Doctor</option>
            <option value="PARAMEDIC">Paramedic</option>
            <option value="ADMIN">Admin</option>
            <option value="OTHER">Other</option>
          </select>
          <input
            type="text"
            placeholder="Matricule..."
            value={filters.matricule}
            onChange={(e) => handleFilterChange("matricule", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Phone..."
            value={filters.phone}
            onChange={(e) => handleFilterChange("phone", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Email..."
            value={filters.email}
            onChange={(e) => handleFilterChange("email", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
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
                      {selectedStaff?.firstname} {selectedStaff?.lastname}
                    </span>
                    ? The staff member can be restored later.
                  </>
                ) : (
                  <>
                    Are you sure you want to restore{" "}
                    <span className="font-semibold">
                      {selectedStaff?.firstname} {selectedStaff?.lastname}
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