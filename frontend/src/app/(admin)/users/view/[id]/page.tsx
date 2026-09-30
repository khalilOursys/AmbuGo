// app/users/view/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import {
  ArrowLeft,
  Edit,
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";

type UserRole = "ADMIN" | "MANAGER" | "USER";

interface UserDetail {
  id: string;
  email: string;
  telephone: string | null;
  firstName: string | null;
  lastName: string | null;
  cin: string | null;
  role: UserRole;
  companyId: string | null;
  company: { id: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt: string | null;
}

const roleColors: Record<string, string> = {
  ADMIN: "bg-red-100 text-red-800",
  MANAGER: "bg-blue-100 text-blue-800",
  USER: "bg-gray-100 text-gray-800",
};

const fetchUser = async (id: string): Promise<UserDetail> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch user");
  }
  return res.json();
};

export default function ViewUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const { data: user, isLoading, isError, error } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  });

  const handleBack = () => router.push("/users");
  const handleEdit = () => router.push(`/users/edit/${userId}`);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-red-700">
            ❌ {(error as Error)?.message || "User not found"}
          </p>
          <button
            onClick={handleBack}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "N/A";

  return (
    <Toast.Provider>
      <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <button
            onClick={handleBack}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Users
          </button>

          <button
            onClick={handleEdit}
            className="rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Edit User
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {/* Title Header */}
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                  {fullName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.USER
                  }`}
              >
                {user.role}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${user.isDeleted
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                  }`}
              >
                {user.isDeleted ? (
                  <>
                    <XCircle className="w-3 h-3" /> Deleted
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3" /> Active
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <InfoCard title="Personal Information" icon={<User className="w-5 h-5" />}>
                <InfoRow label="First Name" value={user.firstName} />
                <InfoRow label="Last Name" value={user.lastName} />
                <InfoRow label="CIN" value={user.cin} />
              </InfoCard>

              {/* Contact Information */}
              <InfoCard title="Contact Information" icon={<Phone className="w-5 h-5" />}>
                <InfoRow
                  label="Email"
                  value={user.email}
                  href={`mailto:${user.email}`}
                />
                <InfoRow
                  label="Telephone"
                  value={user.telephone}
                  href={user.telephone ? `tel:${user.telephone}` : undefined}
                />
              </InfoCard>

              {/* Role & Access */}
              <InfoCard title="Role & Access" icon={<Shield className="w-5 h-5" />}>
                <InfoRow label="Role" value={user.role} />
              </InfoCard>

              {/* Company */}
              <InfoCard title="Company" icon={<Building2 className="w-5 h-5" />}>
                {user.company ? (
                  <>
                    <InfoRow label="Name" value={user.company.name} />
                    <InfoRow label="Company ID" value={user.company.id} />
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No company assigned</p>
                )}
              </InfoCard>

              {/* Timeline */}
              <div className="md:col-span-2">
                <InfoCard title="Timeline" icon={<Calendar className="w-5 h-5" />}>
                  <InfoRow
                    label="Created At"
                    value={new Date(user.createdAt).toLocaleString()}
                  />
                  <InfoRow
                    label="Updated At"
                    value={new Date(user.updatedAt).toLocaleString()}
                  />
                  {user.deletedAt && (
                    <InfoRow
                      label="Deleted At"
                      value={new Date(user.deletedAt).toLocaleString()}
                    />
                  )}
                </InfoCard>
              </div>
            </div>
          </div>
        </div>

        {/* Toast */}
        <Toast.Root
          open={toastOpen}
          onOpenChange={setToastOpen}
          className={`fixed top-20 right-4 w-80 rounded-md p-4 shadow-lg z-50 ${toastType === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
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

// ------------------ Reusable Sub-Components ------------------
function InfoCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-stroke dark:border-strokedark p-4">
      <h4 className="text-sm font-semibold text-black dark:text-white flex items-center gap-2 mb-3 pb-2 border-b border-stroke dark:border-strokedark">
        {icon}
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  href,
  external,
}: {
  label: string;
  value: string | null | undefined;
  href?: string;
  external?: boolean;
}) {
  return (
    <div className="flex justify-between items-start gap-3 text-sm">
      <span className="text-gray-500 dark:text-gray-400 shrink-0">{label}:</span>
      {value ? (
        href ? (
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 break-all text-right"
          >
            {value}
          </a>
        ) : (
          <span className="text-black dark:text-white break-all text-right">{value}</span>
        )
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </div>
  );
}