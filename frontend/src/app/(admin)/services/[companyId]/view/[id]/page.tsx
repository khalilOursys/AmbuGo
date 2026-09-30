// app/admin/[companyId]/services/view/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import {
  ArrowLeft,
  Edit,
  Wrench,
  Tag,
  FileText,
  DollarSign,
  Calendar,
  Building2,
} from "lucide-react";

// ------------------ Types ------------------
interface ServiceDetail {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unitPrice: number | string; // API may return Decimal as string
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string } | null;
}

// ------------------ Fetcher ------------------
const fetchService = async (id: string): Promise<ServiceDetail> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/services/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch service");
  }
  return res.json();
};

// ------------------ Helpers ------------------
const toNumber = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined) return null;
  const num = typeof value === "string" ? parseFloat(value) : value;
  return isNaN(num) ? null : num;
};

const formatPrice = (value: number | string | null | undefined): string | null => {
  const num = toNumber(value);
  return num === null ? null : `$${num.toFixed(2)}`;
};

// ------------------ Component ------------------
export default function ViewServicePage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.companyId as string;
  const serviceId = params.id as string;

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const { data: service, isLoading, isError, error } = useQuery({
    queryKey: ["service", serviceId],
    queryFn: () => fetchService(serviceId),
    enabled: !!serviceId,
  });

  const handleBack = () => router.push(`/services/${companyId}`);
  const handleEdit = () =>
    router.push(`/services/${companyId}/edit/${serviceId}`);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (isError || !service) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-red-700">
            ❌ {(error as Error)?.message || "Service not found"}
          </p>
          <button
            onClick={handleBack}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  const unitPrice = formatPrice(service.unitPrice);

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
            Back to Services
          </button>

          <button
            onClick={handleEdit}
            className="rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Edit Service
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {/* Title Header */}
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Wrench className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                  {service.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Code: {service.code}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {unitPrice && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {unitPrice} / unit
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="p-6.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Identification */}
              <InfoCard title="Identification" icon={<Tag className="w-5 h-5" />}>
                <InfoRow label="Code" value={service.code} />
                <InfoRow label="Name" value={service.name} />
              </InfoCard>

              {/* Pricing */}
              <InfoCard title="Pricing" icon={<DollarSign className="w-5 h-5" />}>
                <InfoRow label="Unit Price" value={unitPrice} />
              </InfoCard>

              {/* Company */}
              <InfoCard title="Company" icon={<Building2 className="w-5 h-5" />}>
                {service.company ? (
                  <>
                    <InfoRow label="Name" value={service.company.name} />
                    <InfoRow label="Company ID" value={service.company.id} />
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No company assigned</p>
                )}
              </InfoCard>

              {/* Timeline */}
              <InfoCard title="Timeline" icon={<Calendar className="w-5 h-5" />}>
                <InfoRow
                  label="Created At"
                  value={new Date(service.createdAt).toLocaleString()}
                />
                <InfoRow
                  label="Updated At"
                  value={new Date(service.updatedAt).toLocaleString()}
                />
              </InfoCard>

              {/* Description */}
              {service.description && (
                <div className="md:col-span-2">
                  <InfoCard
                    title="Description"
                    icon={<FileText className="w-5 h-5" />}
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {service.description}
                    </p>
                  </InfoCard>
                </div>
              )}
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