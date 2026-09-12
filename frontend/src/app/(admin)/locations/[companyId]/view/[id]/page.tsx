"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import {
  ArrowLeft,
  Edit,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Calendar,
  FileText,
  Activity,
  Navigation,
} from "lucide-react";

// ------------------ Types ------------------
interface LocationDetail {
  id: string;
  name: string;
  type: string;
  phone: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  website: string | null;
  email: string | null;
  notes: string | null;
  companyId: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string } | null;
  missions: Array<{
    id: string;
    code: string;
    status: string;
    priority: string;
    callDate: string;
  }>;
  _count?: { missions: number };
}

// ------------------ Fetcher ------------------
const fetchLocation = async (id: string): Promise<LocationDetail> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/locations/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch location");
  }
  return res.json();
};

// ------------------ Helpers ------------------
const typeColors: Record<string, string> = {
  HOSPITAL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  CLINIC: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MEDICAL_CENTER:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  PHARMACY:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  NURSING_HOME:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  RESIDENCE: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
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

const priorityColors: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-800",
  NORMAL: "bg-blue-100 text-blue-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

// ------------------ Component ------------------
export default function ViewLocationPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.companyId as string;
  const locationId = params.id as string;

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const {
    data: location,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["location", locationId],
    queryFn: () => fetchLocation(locationId),
    enabled: !!locationId,
  });

  const handleBack = () => router.push(`/locations/${companyId}`);
  const handleEdit = () =>
    router.push(`/locations/${companyId}/edit/${locationId}`);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (isError || !location) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-red-700">
            ❌ {(error as Error)?.message || "Location not found"}
          </p>
          <button
            onClick={handleBack}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Locations
          </button>
        </div>
      </div>
    );
  }

  const hasCoordinates =
    location.latitude !== null && location.longitude !== null;

  const mapUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${location.latitude},${location.longitude}`
    : null;

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
            Back to Locations
          </button>

          <button
            onClick={handleEdit}
            className="rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Edit Location
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {/* Title Header */}
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                {location.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Location ID: {location.id}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[location.type] || typeColors.OTHER
                  }`}
              >
                {location.type}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${location.isDeleted
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                  }`}
              >
                {location.isDeleted ? "Deleted" : "Active"}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Info */}
              <InfoCard
                title="Contact Information"
                icon={<Phone className="w-5 h-5" />}
              >
                <InfoRow
                  label="Phone"
                  value={location.phone}
                  href={location.phone ? `tel:${location.phone}` : undefined}
                />
                <InfoRow
                  label="Email"
                  value={location.email}
                  href={location.email ? `mailto:${location.email}` : undefined}
                />
                <InfoRow
                  label="Website"
                  value={location.website}
                  href={location.website || undefined}
                  external
                />
              </InfoCard>

              {/* Address & Location */}
              <InfoCard
                title="Address & Coordinates"
                icon={<MapPin className="w-5 h-5" />}
              >
                <InfoRow label="Address" value={location.address} />
                <InfoRow
                  label="Latitude"
                  value={location.latitude?.toString() ?? null}
                />
                <InfoRow
                  label="Longitude"
                  value={location.longitude?.toString() ?? null}
                />
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                  >
                    <Navigation className="w-4 h-4" />
                    Open in Google Maps
                  </a>
                )}
              </InfoCard>

              {/* Company */}
              <InfoCard
                title="Company"
                icon={<Building2 className="w-5 h-5" />}
              >
                {location.company ? (
                  <>
                    <InfoRow label="Name" value={location.company.name} />
                    <InfoRow label="Company ID" value={location.company.id} />
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
                  value={new Date(location.createdAt).toLocaleString()}
                />
                <InfoRow
                  label="Updated At"
                  value={new Date(location.updatedAt).toLocaleString()}
                />
                {location.deletedAt && (
                  <InfoRow
                    label="Deleted At"
                    value={new Date(location.deletedAt).toLocaleString()}
                  />
                )}
              </InfoCard>

              {/* Notes */}
              {location.notes && (
                <div className="md:col-span-2">
                  <InfoCard
                    title="Notes"
                    icon={<FileText className="w-5 h-5" />}
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {location.notes}
                    </p>
                  </InfoCard>
                </div>
              )}

              {/* Missions */}
              <div className="md:col-span-2">
                <InfoCard
                  title={`Recent Missions (${location._count?.missions ?? 0})`}
                  icon={<Activity className="w-5 h-5" />}
                >
                  {location.missions && location.missions.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-stroke dark:border-strokedark">
                            <th className="text-left py-2 px-2 font-medium">
                              Code
                            </th>
                            <th className="text-left py-2 px-2 font-medium">
                              Status
                            </th>
                            <th className="text-left py-2 px-2 font-medium">
                              Priority
                            </th>
                            <th className="text-left py-2 px-2 font-medium">
                              Call Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {location.missions.map((m) => (
                            <tr
                              key={m.id}
                              className="border-b border-stroke dark:border-strokedark"
                            >
                              <td className="py-2 px-2 font-mono text-xs">
                                {m.code}
                              </td>
                              <td className="py-2 px-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${statusColors[m.status] ||
                                    "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                  {m.status}
                                </span>
                              </td>
                              <td className="py-2 px-2">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs ${priorityColors[m.priority] ||
                                    "bg-gray-100 text-gray-800"
                                    }`}
                                >
                                  {m.priority}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-xs">
                                {new Date(m.callDate).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No missions associated with this location.
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