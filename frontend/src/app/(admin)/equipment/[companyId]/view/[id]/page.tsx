// app/admin/[companyId]/equipment/view/[id]/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import {
  ArrowLeft,
  Edit,
  Package,
  Tag,
  FileText,
  Hash,
  Calendar,
  Building2,
} from "lucide-react";

// ------------------ Types ------------------
interface EquipmentDetail {
  id: string;
  code: string;
  name: string;
  description: string | null;
  quantity: number;
  purchasePrice: number | string | null; // API may return Decimal as string
  companyId: string | null;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string } | null;
}

// ------------------ Fetcher ------------------
const fetchEquipment = async (id: string): Promise<EquipmentDetail> => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/equipment/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to fetch equipment");
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
export default function ViewEquipmentPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params.companyId as string;
  const equipmentId = params.id as string;

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMsg(msg);
    setToastType(type);
    setToastOpen(true);
  };

  const { data: equipment, isLoading, isError, error } = useQuery({
    queryKey: ["equipment", equipmentId],
    queryFn: () => fetchEquipment(equipmentId),
    enabled: !!equipmentId,
  });

  const handleBack = () => router.push(`/equipment/${companyId}`);
  const handleEdit = () =>
    router.push(`/equipment/${companyId}/edit/${equipmentId}`);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (isError || !equipment) {
    return (
      <div className="p-6">
        <div className="rounded-md bg-red-50 border border-red-200 p-4">
          <p className="text-red-700">
            ❌ {(error as Error)?.message || "Equipment not found"}
          </p>
          <button
            onClick={handleBack}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Equipment
          </button>
        </div>
      </div>
    );
  }

  const unitPrice = formatPrice(equipment.purchasePrice);
  const totalValue = (() => {
    const p = toNumber(equipment.purchasePrice);
    const q = toNumber(equipment.quantity);
    if (p === null || q === null) return null;
    return `$${(p * q).toFixed(2)}`;
  })();

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
            Back to Equipment
          </button>

          <button
            onClick={handleEdit}
            className="rounded-md bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600 transition-colors flex items-center gap-2"
          >
            <Edit className="w-5 h-5" />
            Edit Equipment
          </button>
        </div>

        {/* Main Card */}
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          {/* Title Header */}
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-black dark:text-white flex items-center gap-2">
                  {equipment.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Code: {equipment.code}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${equipment.quantity > 0
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                  }`}
              >
                {equipment.quantity > 0 ? "In Stock" : "Out of Stock"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Qty: {equipment.quantity}
              </span>
              {unitPrice && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
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
                <InfoRow label="Code" value={equipment.code} />
                <InfoRow label="Name" value={equipment.name} />
              </InfoCard>

              {/* Inventory */}
              <InfoCard title="Inventory" icon={<Hash className="w-5 h-5" />}>
                <InfoRow label="Quantity" value={String(equipment.quantity)} />
                <InfoRow label="Purchase Price" value={unitPrice} />
                <InfoRow label="Total Value" value={totalValue} />
              </InfoCard>

              {/* Company */}
              <InfoCard title="Company" icon={<Building2 className="w-5 h-5" />}>
                {equipment.company ? (
                  <>
                    <InfoRow label="Name" value={equipment.company.name} />
                    <InfoRow label="Company ID" value={equipment.company.id} />
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No company assigned</p>
                )}
              </InfoCard>

              {/* Timeline */}
              <InfoCard title="Timeline" icon={<Calendar className="w-5 h-5" />}>
                <InfoRow
                  label="Created At"
                  value={new Date(equipment.createdAt).toLocaleString()}
                />
                <InfoRow
                  label="Updated At"
                  value={new Date(equipment.updatedAt).toLocaleString()}
                />
              </InfoCard>

              {/* Description */}
              {equipment.description && (
                <div className="md:col-span-2">
                  <InfoCard
                    title="Description"
                    icon={<FileText className="w-5 h-5" />}
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {equipment.description}
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