// app/staff/[companyId]/view/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import {
  ArrowLeft,
  Edit,
  User,
  Phone,
  Mail,
  Building2,
  Calendar,
  FileText,
  Activity,
  BadgeCheck,
} from "lucide-react";

// ------------------ Types ------------------
interface StaffDetail {
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
    role: string;
  } | null;
  company: { id: string; name: string } | null;
  assignmentStaff: Array<{
    id: string;
    assignment: {
      id: string;
      isComplete: boolean;
      mission: {
        id: string;
        code: string;
        status: string;
      } | null;
      vehicle: {
        id: string;
        registration: string;
      } | null;
    };
  }>;
  vehicleSchedules: Array<{
    id: string;
    status: string;
    vehicle: {
      id: string;
      registration: string;
    };
  }>;
  _count?: { assignmentStaff: number };
}

// ------------------ Fetcher ------------------
const fetchStaff = async (id: string): Promise<StaffDetail> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/staff/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch staff");
  }
  return res.json();
};

// ------------------ Helpers ------------------
const typeColors: Record<string, string> = {
  DRIVER: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  NURSE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  DOCTOR:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  PARAMEDIC:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  ADMIN: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
  OTHER: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

const statusColors: Record<string, string> = {
  CREATED: "bg-gray-100 text-gray-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  DISPATCHED: "bg-indigo-100 text-indigo-800",
  EN_ROUTE: "bg-yellow-100 text-yellow-800",
  ON_SCENE: "bg-orange-100 text-orange-800",
  TRANSPORTING: "bg-purple-100 text-purple-800",
  ARRIVED_HOSPITAL: "bg-cyan-100 text-cyan-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

// ------------------ Component ------------------
export default function ViewStaffPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.companyId as string;
  const staffId = params.id as string;

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const {
    data: staff,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["staff", staffId],
    queryFn: () => fetchStaff(staffId),
    enabled: !!staffId,
  });

  const handleBack = () => router.push(`/staff/${companyId}`);
  const handleEdit = () => router.push(`/staff/${companyId}/edit/${staffId}`);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (isError || !staff) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-red-700">
            ❌ {(error as Error)?.message || "Staff not found"}
          </p>
          <button
            onClick={handleBack}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Staff
          </button>
        </div>
      </div>
    );
  }

  const activeAssignments =
    staff.assignmentStaff?.filter((a) => !a.assignment.isComplete) || [];

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
            Back to Staff
          </button>

          <button
            onClick={handleEdit}
            className="rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Edit Staff
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {/* Title Header */}
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                <User className="w-6 h-6" />
                {staff.firstname} {staff.lastname}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Staff ID: {staff.id}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[staff.type] || typeColors.OTHER
                  }`}
              >
                {staff.type}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${staff.isDeleted
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                  }`}
              >
                {staff.isDeleted ? "Deleted" : "Active"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <InfoCard
                title="Personal Information"
                icon={<User className="w-5 h-5" />}
              >
                <InfoRow label="First Name" value={staff.firstname} />
                <InfoRow label="Last Name" value={staff.lastname} />
                <InfoRow label="Matricule" value={staff.matricule} />
              </InfoCard>

              {/* Contact Info */}
              <InfoCard
                title="Contact Information"
                icon={<Phone className="w-5 h-5" />}
              >
                <InfoRow
                  label="Phone"
                  value={staff.phone}
                  href={staff.phone ? `tel:${staff.phone}` : undefined}
                />
                <InfoRow
                  label="Email"
                  value={staff.email}
                  href={staff.email ? `mailto:${staff.email}` : undefined}
                />
              </InfoCard>

              {/* User Account */}
              <InfoCard
                title="Linked User Account"
                icon={<BadgeCheck className="w-5 h-5" />}
              >
                {staff.user ? (
                  <>
                    <InfoRow
                      label="Name"
                      value={`${staff.user.firstName} ${staff.user.lastName}`}
                    />
                    <InfoRow label="Email" value={staff.user.email} />
                    <InfoRow label="Phone" value={staff.user.telephone} />
                    <InfoRow label="Role" value={staff.user.role} />
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No user account linked</p>
                )}
              </InfoCard>

              {/* Company */}
              <InfoCard
                title="Company"
                icon={<Building2 className="w-5 h-5" />}
              >
                {staff.company ? (
                  <>
                    <InfoRow label="Name" value={staff.company.name} />
                    <InfoRow label="Company ID" value={staff.company.id} />
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No company assigned</p>
                )}
              </InfoCard>

              {/* Timeline */}
              <InfoCard
                title="Timeline"
                icon={<Calendar className="w-5 h-5" />}
              >
                <InfoRow
                  label="Created At"
                  value={new Date(staff.createdAt).toLocaleString()}
                />
                <InfoRow
                  label="Updated At"
                  value={new Date(staff.updatedAt).toLocaleString()}
                />
                {staff.deletedAt && (
                  <InfoRow
                    label="Deleted At"
                    value={new Date(staff.deletedAt).toLocaleString()}
                  />
                )}
              </InfoCard>

              {/* Active Assignments */}
              <InfoCard
                title={`Active Assignments (${activeAssignments.length})`}
                icon={<Activity className="w-5 h-5" />}
              >
                {activeAssignments.length > 0 ? (
                  <div className="space-y-3">
                    {activeAssignments.map((a) => (
                      <div
                        key={a.id}
                        className="rounded-md border border-stroke dark:border-strokedark p-3"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <p className="text-sm font-medium">
                              Mission: {a.assignment.mission?.code || "—"}
                            </p>
                            {a.assignment.vehicle && (
                              <p className="text-xs text-gray-500">
                                Vehicle: {a.assignment.vehicle.registration}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs ${statusColors[a.assignment.mission?.status || ""] ||
                              "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {a.assignment.mission?.status || "—"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No active assignments
                  </p>
                )}
              </InfoCard>

              {/* Vehicle Schedules */}
              <div className="md:col-span-2">
                <InfoCard
                  title={`Vehicle Schedules (${staff.vehicleSchedules?.length || 0})`}
                  icon={<Calendar className="w-5 h-5" />}
                >
                  {staff.vehicleSchedules && staff.vehicleSchedules.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-stroke dark:border-strokedark">
                            <th className="text-left py-2 px-2 font-medium">
                              Vehicle
                            </th>
                            <th className="text-left py-2 px-2 font-medium">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {staff.vehicleSchedules.map((s) => (
                            <tr
                              key={s.id}
                              className="border-b border-stroke dark:border-strokedark"
                            >
                              <td className="py-2 px-2">
                                {s.vehicle?.registration || "—"}
                              </td>
                              <td className="py-2 px-2">
                                <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                                  {s.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No vehicle schedules assigned
                    </p>
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
          className={`fixed top-20 right-4 w-80 rounded-md p-4 shadow-lg z-50 ${toastType === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
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
      <span className="text-gray-500 dark:text-gray-400 shrink-0">
        {label}:
      </span>
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
          <span className="text-black dark:text-white break-all text-right">
            {value}
          </span>
        )
      ) : (
        <span className="text-gray-400">—</span>
      )}
    </div>
  );
}