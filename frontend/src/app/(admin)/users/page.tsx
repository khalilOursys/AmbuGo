// app/users/page.tsx
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
type User = {
  id: string;
  email: string;
  password: string | null;
  telephone: string | null;
  firstName: string | null;
  lastName: string | null;
  cin: string | null;
  role: string;
  companyId: string | null;
  company: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
  _count?: {
    auditLogs: number;
    notifications: number;
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

// ------------------ Fetchers ------------------
const fetchUsers = async ({
  page,
  limit,
  firstName,
  lastName,
  email,
  role,
  telephone,
  cin,
  companyId,
  isDeleted,
}: {
  page: number;
  limit: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  telephone?: string;
  cin?: string;
  companyId?: string;
  isDeleted?: boolean;
}): Promise<PaginatedResponse<User>> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  if (firstName) params.append("firstName", firstName);
  if (lastName) params.append("lastName", lastName);
  if (email) params.append("email", email);
  if (role) params.append("role", role);
  if (telephone) params.append("telephone", telephone);
  if (cin) params.append("cin", cin);
  if (companyId) params.append("companyId", companyId);
  if (isDeleted !== undefined) params.append("isDeleted", isDeleted.toString());

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/users?${params.toString()}`
  );
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

// Fetch roles from API
const fetchRoles = async (): Promise<string[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/roles`);
  if (!response.ok) throw new Error("Failed to fetch roles");
  const data = await response.json();
  return data.roles;
};

// Role color mapping (you can customize this)
const getRoleColor = (role: string): string => {
  const colors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-800",
    MANAGER: "bg-blue-100 text-blue-800",
    USER: "bg-gray-100 text-gray-800",
  };
  return colors[role] || "bg-gray-100 text-gray-800";
};

// ------------------ Component ------------------
export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    telephone: "",
    cin: "",
    companyId: "",
    isDeleted: false,
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  // Fetch roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["user-roles"],
    queryFn: fetchRoles,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users", page, limit, filters],
    queryFn: () =>
      fetchUsers({
        page,
        limit,
        firstName: filters.firstName || undefined,
        lastName: filters.lastName || undefined,
        email: filters.email || undefined,
        role: filters.role || undefined,
        telephone: filters.telephone || undefined,
        cin: filters.cin || undefined,
        companyId: filters.companyId || undefined,
        isDeleted: filters.isDeleted,
      }),
    placeholderData: keepPreviousData,
  });

  const handleAdd = () => {
    router.push("/users/add");
  };

  const handleEdit = (user: User) => {
    router.push(`/users/edit/${user.id}`);
  };

  const handleView = (user: User) => {
    router.push(`/users/${user.id}`);
  };

  const handlePermissions = (user: User) => {
    router.push(`/users/${user.id}/permissions`);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${selectedUser.id}/soft-delete`,
        { method: "PATCH" }
      );

      if (!res.ok) throw new Error("Action failed");

      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast(`✅ User ${selectedUser.email} deleted`, "success");
    } catch (err) {
      showToast(`❌ Failed to delete user`, "error");
    } finally {
      setDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleRestore = async (user: User) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${user.id}/restore`,
        { method: "PATCH" }
      );
      if (!res.ok) throw new Error("Restore failed");

      queryClient.invalidateQueries({ queryKey: ["users"] });
      showToast(`✅ User ${user.email} restored`, "success");
    } catch (err) {
      showToast("❌ Failed to restore user", "error");
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  const handleClearFilters = () => {
    setFilters({
      firstName: "",
      lastName: "",
      email: "",
      role: "",
      telephone: "",
      cin: "",
      companyId: "",
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

  const columns: MRT_ColumnDef<User>[] = [
    {
      accessorKey: "firstName",
      header: "First Name",
      size: 120,
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
      size: 120,
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 180,
    },
    {
      accessorKey: "telephone",
      header: "Phone",
      size: 120,
    },
    {
      accessorKey: "role",
      header: "Role",
      size: 100,
      Cell: ({ cell }) => {
        const role = cell.getValue() as string;
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(role)}`}>
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: "company",
      header: "Company",
      size: 150,
      Cell: ({ cell }) => {
        const company = cell.getValue() as { name: string } | null;
        return company?.name || "-";
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 300,
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
          <button
            className="px-2 py-1 bg-purple-500 text-white rounded-md text-xs hover:bg-purple-600"
            onClick={() => handlePermissions(row.original)}
          >
            Permissions
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
          <h1 className="text-2xl font-bold">Users</h1>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Add New User
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="First Name..."
            value={filters.firstName}
            onChange={(e) => handleFilterChange("firstName", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="Last Name..."
            value={filters.lastName}
            onChange={(e) => handleFilterChange("lastName", e.target.value)}
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
            value={filters.telephone}
            onChange={(e) => handleFilterChange("telephone", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <input
            type="text"
            placeholder="CIN..."
            value={filters.cin}
            onChange={(e) => handleFilterChange("cin", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          />
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange("role", e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="">All Roles</option>
            {rolesLoading ? (
              <option disabled>Loading roles...</option>
            ) : (
              roles.map((role) => (
                <option key={role} value={role}>
                  {role.charAt(0) + role.slice(1).toLowerCase()}
                </option>
              ))
            )}
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
              Selected: <strong>{selectedRowData.email}</strong>
              {selectedRowData.firstName && selectedRowData.lastName && (
                <span className="ml-2 text-gray-500">
                  ({selectedRowData.firstName} {selectedRowData.lastName})
                </span>
              )}
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
                Confirm Delete
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-gray-600">
                Are you sure you want to delete user{" "}
                <span className="font-semibold">
                  {selectedUser?.email ?? ""}
                </span>
                ? The user can be restored later.
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
                  className="px-4 py-2 rounded-md text-white bg-red-500 hover:bg-red-600"
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