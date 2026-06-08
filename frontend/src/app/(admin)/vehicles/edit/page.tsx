"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api/client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useQueryClient } from "@tanstack/react-query";

type VehicleType =
  | "AMBULANCE"
  | "VSL"
  | "TPMR"
  | "MEDICAL_MOTORBIKE";

type VehicleStatus =
  | "AVAILABLE"
  | "ASSIGNED"
  | "ON_MISSION"
  | "MAINTENANCE"
  | "OUT_OF_SERVICE";

export default function EditVehiclePage() {
const queryClient = useQueryClient();

  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    licensePlate: "",
    brand: "",
    model: "",
    type: "AMBULANCE" as VehicleType,

    sanitaryApprovalNo: "",
    sanitaryExpiryDate: null as Date | null,

    technicalControlDate: null as Date | null,
    nextTechnicalControl: null as Date | null,

    insurancePolicyNo: "",
    insuranceCompany: "",
    insuranceExpiryDate: null as Date | null,

    medicalEquipment: "",
    mileage: 0,
    maintenancePlan: "",

    status: "AVAILABLE" as VehicleStatus,
  });

  useEffect(() => {
  if (!id) {
    setLoading(false);
    return;
  }

  const loadVehicle = async () => {
    try {
      const vehicle = await apiClient.get<any>(`/vehicles/${id}`);

      setForm({
        licensePlate: vehicle.licensePlate ?? "",
        brand: vehicle.brand ?? "",
        model: vehicle.model ?? "",
        type: vehicle.type,

        sanitaryApprovalNo: vehicle.sanitaryApprovalNo ?? "",
        sanitaryExpiryDate: vehicle.sanitaryExpiryDate
          ? new Date(vehicle.sanitaryExpiryDate)
          : null,

        technicalControlDate: vehicle.technicalControlDate
          ? new Date(vehicle.technicalControlDate)
          : null,

        nextTechnicalControl: vehicle.nextTechnicalControl
          ? new Date(vehicle.nextTechnicalControl)
          : null,

        insurancePolicyNo: vehicle.insurancePolicyNo ?? "",
        insuranceCompany: vehicle.insuranceCompany ?? "",

        insuranceExpiryDate: vehicle.insuranceExpiryDate
          ? new Date(vehicle.insuranceExpiryDate)
          : null,

        medicalEquipment: vehicle.medicalEquipment ?? "",
        mileage: vehicle.mileage ?? 0,
        maintenancePlan: vehicle.maintenancePlan ?? "",
        status: vehicle.status,
      });
    } finally {
      setLoading(false);
    }
  };

  loadVehicle();
}, [id]);

  type FormKey = keyof typeof form;

const handleChange = (
  key: FormKey,
  value: string | number | Date | null
) => {
  setForm((prev) => ({
    ...prev,
    [key]: value,
  }));
};

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!id) return;

  const payload = {
    ...form,
    sanitaryExpiryDate: form.sanitaryExpiryDate?.toISOString() ?? null,
    technicalControlDate: form.technicalControlDate?.toISOString() ?? null,
    nextTechnicalControl: form.nextTechnicalControl?.toISOString() ?? null,
    insuranceExpiryDate: form.insuranceExpiryDate?.toISOString() ?? null,
    mileage: Number(form.mileage),
  };

  try {
    await apiClient.put(`/vehicles/${id}`, payload);

    await queryClient.invalidateQueries({ queryKey: ["vehicles"] });

    router.push("/vehicles");
  } catch (err: any) {
    alert(err.message || "Update failed");
  }
};

  if (loading) {
    return (
      <div className="p-6">
        Loading vehicle...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-6">
        Edit Vehicle
      </h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        <input
          placeholder="License Plate"
          value={form.licensePlate}
          onChange={(e) =>
            handleChange(
              "licensePlate",
              e.target.value
            )
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Brand"
          value={form.brand}
          onChange={(e) =>
            handleChange("brand", e.target.value)
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Model"
          value={form.model}
          onChange={(e) =>
            handleChange("model", e.target.value)
          }
          className="border p-2 w-full"
        />

        <select
          value={form.type}
          onChange={(e) =>
            handleChange(
              "type",
              e.target.value as VehicleType
            )
          }
          className="border p-2 w-full"
        >
          <option value="AMBULANCE">
            AMBULANCE
          </option>
          <option value="VSL">VSL</option>
          <option value="TPMR">TPMR</option>
          <option value="MEDICAL_MOTORBIKE">
            MEDICAL MOTORBIKE
          </option>
        </select>

        <input
          placeholder="Sanitary Approval No"
          value={form.sanitaryApprovalNo}
          onChange={(e) =>
            handleChange(
              "sanitaryApprovalNo",
              e.target.value
            )
          }
          className="border p-2 w-full"
        />

        <DatePicker
          selected={form.sanitaryExpiryDate}
          onChange={(date: Date | null) =>
            handleChange(
              "sanitaryExpiryDate",
              date
            )
          }
          dateFormat="yyyy-MM-dd"
          className="border p-2 w-full"
        />

        <DatePicker
          selected={form.technicalControlDate}
          onChange={(date: Date | null) =>
            handleChange(
              "technicalControlDate",
              date
            )
          }
          dateFormat="yyyy-MM-dd"
          className="border p-2 w-full"
        />

        <DatePicker
          selected={form.nextTechnicalControl}
          onChange={(date: Date | null) =>
            handleChange(
              "nextTechnicalControl",
              date
            )
          }
          dateFormat="yyyy-MM-dd"
          className="border p-2 w-full"
        />

        <input
          placeholder="Insurance Policy No"
          value={form.insurancePolicyNo}
          onChange={(e) =>
            handleChange(
              "insurancePolicyNo",
              e.target.value
            )
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Insurance Company"
          value={form.insuranceCompany}
          onChange={(e) =>
            handleChange(
              "insuranceCompany",
              e.target.value
            )
          }
          className="border p-2 w-full"
        />

        <DatePicker
          selected={form.insuranceExpiryDate}
          onChange={(date: Date | null) =>
            handleChange(
              "insuranceExpiryDate",
              date
            )
          }
          dateFormat="yyyy-MM-dd"
          className="border p-2 w-full"
        />

        <input
          placeholder="Medical Equipment"
          value={form.medicalEquipment}
          onChange={(e) =>
            handleChange(
              "medicalEquipment",
              e.target.value
            )
          }
          className="border p-2 w-full"
        />

        <input
          type="number"
          value={form.mileage}
          onChange={(e) =>
            handleChange(
              "mileage",
              Number(e.target.value)
            )
          }
          className="border p-2 w-full"
        />

        <input
          placeholder="Maintenance Plan"
          value={form.maintenancePlan}
          onChange={(e) =>
            handleChange(
              "maintenancePlan",
              e.target.value
            )
          }
          className="border p-2 w-full"
        />

        <select
          value={form.status}
          onChange={(e) =>
            handleChange(
              "status",
              e.target.value as VehicleStatus
            )
          }
          className="border p-2 w-full"
        >
          <option value="AVAILABLE">
            AVAILABLE
          </option>
          <option value="ASSIGNED">
            ASSIGNED
          </option>
          <option value="ON_MISSION">
            ON_MISSION
          </option>
          <option value="MAINTENANCE">
            MAINTENANCE
          </option>
          <option value="OUT_OF_SERVICE">
            OUT_OF_SERVICE
          </option>
        </select>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Update Vehicle
        </button>
      </form>
    </div>
  );
}