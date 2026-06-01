"use client";

import { useState, useEffect } from "react";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, UserPlus } from "lucide-react";

type UserRole = "ADMIN" | "COMMERCIAL";

type User = {
  id: number;
  email: string;
  telephone?: string;
  firstName?: string;
  lastName?: string;
  cin?: string;
  role: UserRole;
  createdAt: string;
};

const fetchUsers = async (): Promise<User[]> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}users`);
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
};

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");

    const observer = new MutationObserver(() => {
      const isDarkNow = document.documentElement.classList.contains("dark");
      setTheme(isDarkNow ? "dark" : "light");
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastOpen(true);
  };

  const {
    data: users = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const handleAddUser = () => {
    router.push("/users/add");
  };

  const handleEdit = (user: User) => {
    router.push(`/users/edit/${user.id}`);
  };

  const handleDelete = async (user: User) => {
    setSelectedUser(user);
    setDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}users/${selectedUser.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");

      await refetch();
      showToast(`✅ User ${selectedUser.email} deleted`);
    } catch (err) {
      showToast("❌ Failed to delete user");
    } finally {
      setDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const columns: MRT_ColumnDef<User>[] = [
    {
      accessorKey: "firstName",
      header: "First Name",
      size: 150,
      Cell: ({ cell }) => cell.getValue<string>() || "-",
    },
    {
      accessorKey: "lastName",
      header: "Last Name",
      size: 150,
      Cell: ({ cell }) => cell.getValue<string>() || "-",
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 250,
    },
    {
      accessorKey: "telephone",
      header: "Telephone",
      size: 150,
      Cell: ({ cell }) => cell.getValue<string>() || "-",
    },
    {
      accessorKey: "cin",
      header: "CIN",
      size: 120,
      Cell: ({ cell }) => cell.getValue<string>() || "-",
    },
    {
      accessorKey: "role",
      header: "Role",
      size: 120,
      Cell: ({ cell }) => {
        const role = cell.getValue<UserRole>();
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${role === "ADMIN"
                ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300"
                : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
              }`}
          >
            {role}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      size: 150,
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      size: 100,
      Cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row.original)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors dark:text-blue-400 dark:hover:bg-blue-900/30"
            title="Edit"
          >
            <Pencil className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDelete(row.original)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors dark:text-red-400 dark:hover:bg-red-900/30"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <Toast.Provider swipeDirection="right">
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Users Management
          </h1>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-800 transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5" />
            Add New User
          </button>
        </div>

        <div className="dark:bg-gray-800 dark:text-white rounded-lg overflow-hidden">
          <MaterialReactTable
            columns={columns}
            data={users}
            enableColumnActions={true}
            enableColumnFilters={true}
            enablePagination={true}
            enableSorting={true}
            enableBottomToolbar={true}
            enableTopToolbar={true}
            muiTableBodyRowProps={{ hover: false }}
            state={{
              isLoading,
            }}
            muiTablePaperProps={{
              sx: {
                backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                color: theme === "dark" ? "#f3f4f6" : "#111827",
              },
            }}
            muiTableHeadCellProps={{
              sx: {
                backgroundColor: theme === "dark" ? "#374151" : "#f9fafb",
                color: theme === "dark" ? "#f3f4f6" : "#374151",
                fontWeight: "bold",
              },
            }}
            muiTableBodyCellProps={{
              sx: {
                borderBottomColor: theme === "dark" ? "#374151" : "#e5e7eb",
                color: theme === "dark" ? "#f3f4f6" : "#111827",
              },
            }}
            muiTopToolbarProps={{
              sx: {
                backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                color: theme === "dark" ? "#f3f4f6" : "#111827",
              },
            }}
            muiBottomToolbarProps={{
              sx: {
                backgroundColor: theme === "dark" ? "#1f2937" : "#ffffff",
                color: theme === "dark" ? "#f3f4f6" : "#111827",
              },
            }}
            muiPaginationProps={{
              sx: {
                color: theme === "dark" ? "#f3f4f6" : "#111827",
                "& .MuiTablePagination-selectIcon": {
                  color: theme === "dark" ? "#f3f4f6" : "#111827",
                },
                "& .MuiTablePagination-actions button": {
                  color: theme === "dark" ? "#f3f4f6" : "#111827",
                },
              },
            }}
          />
        </div>

        {isError && (
          <Toast.Root
            open
            className="bg-red-600 dark:bg-red-700 text-white px-4 py-2 rounded-md shadow-lg"
          >
            <Toast.Title>❌ Failed to fetch users</Toast.Title>
          </Toast.Root>
        )}

        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className="bg-gray-900 dark:bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg"
        >
          <Toast.Title className="font-bold">{toastMsg}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="fixed top-4 right-4 w-96 max-w-full outline-none z-50" />

        <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 w-96 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg z-50 transition-colors duration-200">
              <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                Confirm Delete
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-gray-600 dark:text-gray-300">
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {selectedUser?.email ?? ""}
                </span>
                ?
              </Dialog.Description>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setDialogOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-500 dark:bg-red-600 text-white hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
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