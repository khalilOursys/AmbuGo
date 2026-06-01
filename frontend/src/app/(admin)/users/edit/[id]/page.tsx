"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import { ArrowLeft, Save, User } from "lucide-react";

type UserRole = "ADMIN" | "COMMERCIAL";

interface User {
  id: number;
  email: string;
  telephone?: string;
  firstName?: string;
  lastName?: string;
  cin?: string;
  role: UserRole;
  createdAt: string;
}

interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  telephone?: string;
  cin?: string;
  role?: UserRole;
}

const fetchRoles = async (): Promise<string[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}users/roles`);
  if (!response.ok) throw new Error("Failed to fetch roles");
  const data = await response.json();
  return data.roles;
};

const fetchUser = async (id: string): Promise<User> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}users/${id}`);
  if (!response.ok) throw new Error("Failed to fetch user");
  return response.json();
};

const updateUser = async ({ id, data }: { id: string; data: UpdateUserDto }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}users/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update user");
  }
  return response.json();
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: PageProps) {
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  if (!resolvedParams) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return <EditUserContent id={resolvedParams.id} />;
}

function EditUserContent({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const [formData, setFormData] = useState<UpdateUserDto>({
    email: "",
    firstName: "",
    lastName: "",
    telephone: "",
    cin: "",
    role: "COMMERCIAL",
  });

  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["user-roles"],
    queryFn: fetchRoles,
  });

  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        telephone: user.telephone || "",
        cin: user.cin || "",
        role: user.role,
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", id] });
      showToast("✅ User updated successfully", "success");
      setTimeout(() => router.push("/users"), 1500);
    },
    onError: (error: Error) => {
      showToast(`❌ ${error.message || "Connection problem"}`, "error");
    },
    onSettled: () => setIsSubmitting(false),
  });

  const submitForm = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const updateData: UpdateUserDto = { ...formData };

    if (password) {
      updateData.password = password;
    }

    updateMutation.mutate({ id, data: updateData });
  };

  const handleCancel = () => router.push("/users");

  const formatRoleName = (role: string) => {
    return role.charAt(0) + role.slice(1).toLowerCase();
  };

  if (isLoadingUser) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <Toast.Provider>
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => router.push("/users")}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </button>
        </div>

        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
              <User className="w-6 h-6" />
              Edit User
            </h3>
          </div>

          <form onSubmit={submitForm}>
            <div className="p-6.5">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Email <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="user@example.com"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="Leave blank to keep current password"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Only fill if you want to change the password
                  </p>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="John"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="Doe"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Telephone
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="+216 XX XXX XXX"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    CIN
                  </label>
                  <input
                    type="text"
                    value={formData.cin}
                    onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    placeholder="National ID"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Role <span className="text-danger">*</span>
                  </label>
                  {rolesLoading ? (
                    <div className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {formatRoleName(role)}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="rounded-md border border-stroke px-6 py-3 font-medium hover:bg-gray-100 dark:hover:bg-meta-4 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-md bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-90 transition-colors flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Update User
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`fixed top-20 right-4 w-80 rounded-md p-4 shadow-lg z-50 ${toastType === "success"
              ? "bg-green-600 dark:bg-green-700 text-white"
              : "bg-red-600 dark:bg-red-700 text-white"
            }`}
          duration={3000}
        >
          <Toast.Title className="font-medium">{toastMsg}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="fixed top-4 right-4 z-50 outline-none" />
      </div>
    </Toast.Provider>
  );
}