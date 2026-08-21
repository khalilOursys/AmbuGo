// src/app/vehicles/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as Toast from "@radix-ui/react-toast";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { useVehicle } from "@/hooks/useVehicles";
import { Pencil, Trash2, ArrowLeft, MapPin, Clock, Users, Package } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function VehicleDetailsPage({ params }: PageProps) {
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

  return <VehicleDetailsContent id={resolvedParams.id} />;
}

function VehicleDetailsContent({ id }: { id: string }) {
  const router = useRouter();
  const { data: vehicle, isLoading } = useVehicle(id);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      AVAILABLE: "bg-green-100 text-green-800",
      ASSIGNED: "bg-blue-100 text-blue-800",
      BUSY: "bg-red-100 text-red-800",
      MAINTENANCE: "bg-yellow-100 text-yellow-800",
      OFFLINE: "bg-gray-100 text-gray-800",
    };
    return colors[status] || colors.OFFLINE;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      AVAILABLE: "Disponible",
      ASSIGNED: "Assigné",
      BUSY: "Occupé",
      MAINTENANCE: "Maintenance",
      OFFLINE: "Hors ligne",
    };
    return labels[status] || status;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">Véhicule non trouvé</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageBreadcrumb pageTitle={`Détails du véhicule ${vehicle.registration}`} />

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push("/vehicles")}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la liste
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/vehicles/edit/${vehicle.id}`)}
            className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            Modifier
          </button>
        </div>
      </div>

      {/* Vehicle Info Card */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Immatriculation</p>
            <p className="text-lg font-semibold text-black dark:text-white">{vehicle.registration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Marque / Modèle</p>
            <p className="text-lg font-semibold text-black dark:text-white">
              {vehicle.brand || '-'} {vehicle.model || ''}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Niveau</p>
            <p className="text-lg font-semibold text-black dark:text-white">{vehicle.level}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Statut</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
              {getStatusLabel(vehicle.status)}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
            <p className="text-lg font-semibold text-black dark:text-white">
              {vehicle.vehicleType?.name || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Compagnie</p>
            <p className="text-lg font-semibold text-black dark:text-white">
              {vehicle.company?.name || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Staff Schedules */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6 mb-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Plannings du personnel
        </h3>
        {vehicle.staffSchedules && vehicle.staffSchedules.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Personnel</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Début</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Fin</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Statut</th>
                </tr>
              </thead>
              <tbody>
                {vehicle.staffSchedules.map((schedule: any) => (
                  <tr key={schedule.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="px-4 py-2">
                      {schedule.staff?.firstname} {schedule.staff?.lastname}
                      <span className="text-xs text-gray-500 block">{schedule.staff?.matricule}</span>
                    </td>
                    <td className="px-4 py-2">{schedule.shiftType}</td>
                    <td className="px-4 py-2">{formatDate(schedule.shiftStart)}</td>
                    <td className="px-4 py-2">{formatDate(schedule.shiftEnd)}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${schedule.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {schedule.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Aucun planning assigné</p>
        )}
      </div>

      {/* Equipment */}
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark p-6">
        <h3 className="text-lg font-semibold text-black dark:text-white mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Équipement
        </h3>
        {vehicle.equipment && vehicle.equipment.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Code</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Nom</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Quantité</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-black dark:text-white">Assigné le</th>
                </tr>
              </thead>
              <tbody>
                {vehicle.equipment.map((eq: any) => (
                  <tr key={eq.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="px-4 py-2">{eq.equipment?.code || '-'}</td>
                    <td className="px-4 py-2">{eq.equipment?.name || '-'}</td>
                    <td className="px-4 py-2">{eq.quantity}</td>
                    <td className="px-4 py-2">{formatDate(eq.assignedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Aucun équipement assigné</p>
        )}
      </div>
    </div>
  );
}