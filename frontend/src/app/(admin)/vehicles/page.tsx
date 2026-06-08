"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MaterialReactTable, type MRT_ColumnDef } from "material-react-table";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";


type Vehicle = {
  id: string;
  licensePlate: string;
  brand?: string;
  model?: string;
  type: string;

  sanitaryApprovalNo?: string;
  sanitaryExpiryDate?: string;

  technicalControlDate?: string;
  nextTechnicalControl?: string;

  insurancePolicyNo?: string;
  insuranceCompany?: string;
  insuranceExpiryDate?: string;

  medicalEquipment?: string;
  mileage?: number;
  maintenancePlan?: string;
  status: string;
};



const fetchVehicles = async (): Promise<Vehicle[]> => {
  return apiClient.get("/vehicles");
};


export default function VehiclesPage() {
  const [pagination, setPagination] = useState({
  pageIndex: 0,
  pageSize: 5,
});
  const [search, setSearch] = useState("");
  const router = useRouter();
  const queryClient = useQueryClient(); 

  
  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: fetchVehicles,
  });

 const filteredVehicles = useMemo(() => {
  return vehicles.filter((vehicle) =>
    Object.values(vehicle)
      .map((v) => (v ? String(v) : ""))   // ✅ SAFE CONVERSION
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );
}, [vehicles, search]);

  const handleDelete = async (id: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this vehicle?"
  );

  if (!confirmed) return;

  try {
    await apiClient.delete(`/vehicles/${id}`);
    await queryClient.invalidateQueries({ queryKey: ["vehicles"] });
  } catch (error) {
    console.error("Delete failed", error);
  }
};

  const columns = useMemo<MRT_ColumnDef<Vehicle>[]>(() => [
  { accessorKey: "licensePlate", header: "Plate" },
  { accessorKey: "brand", header: "Brand" },
  { accessorKey: "model", header: "Model" },
  { accessorKey: "type", header: "Type" },
  { accessorKey: "sanitaryApprovalNo", header: "Sanitary No" },

  {
    accessorKey: "sanitaryExpiryDate",
    header: "Sanitary Expiry",
   Cell: ({ cell }) => {
  const value = cell.getValue();

  if (!value) return "-";

  const date = new Date(value as string);

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString();
},
  },

  {
    accessorKey: "technicalControlDate",
    header: "Tech Control",
   Cell: ({ cell }) => {
  const value = cell.getValue();

  if (!value) return "-";

  const date = new Date(value as string);

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString();
},

  },

  {
    accessorKey: "nextTechnicalControl",
    header: "Next Control",
    Cell: ({ cell }) => {
  const value = cell.getValue();

  if (!value) return "-";

  const date = new Date(value as string);

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString();
},
  },

  { accessorKey: "insurancePolicyNo", header: "Policy" },
  { accessorKey: "insuranceCompany", header: "Insurance" },

  {
    accessorKey: "insuranceExpiryDate",
    header: "Insurance Expiry",
   Cell: ({ cell }) => {
  const value = cell.getValue();

  if (!value) return "-";

  const date = new Date(value as string);

  if (isNaN(date.getTime())) return "-";

  return date.toLocaleDateString();
},
  },

  { accessorKey: "medicalEquipment", header: "Equipment" },
  { accessorKey: "mileage", header: "Mileage" },
  { accessorKey: "maintenancePlan", header: "Maintenance" },
  { accessorKey: "status", header: "Status" },

  {
    id: "actions",
    header: "Actions",
    size: 120,
    Cell: ({ row }) => (
      <div className="flex gap-2 justify-end">
        <button
          onClick={() =>
            router.push(`/vehicles/edit?id=${row.original.id}`)
          }
          className="text-blue-600 hover:text-blue-800"
        >
          <Pencil size={18} />
        </button>

        <button
          onClick={() => handleDelete(row.original.id)}
          className="text-red-600 hover:text-red-800"
        >
          <Trash2 size={18} />
        </button>
      </div>
    ),
  },
], [router]);

  return (

    
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-bold">Vehicles</h1>

        <button
          onClick={() => router.push("/vehicles/add")}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          <Plus size={16} />
          Add Vehicle
        </button>
      </div>

<div className="mb-4 relative max-w-md">
  <Search
    size={18}
    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
  />

  <input
    type="text"
    placeholder="Search vehicles..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="w-full border rounded-lg pl-10 pr-4 py-2"
  />
</div>

    <MaterialReactTable
  columns={columns}
  data={filteredVehicles}
  state={{ isLoading, pagination }}
  onPaginationChange={setPagination}
  initialState={{
    density: "compact",
    pagination: {
      pageIndex: 0,
      pageSize: 5,
    },
  }}

  enablePagination
  enableSorting
  enableColumnFilters={false}
  enableGlobalFilter={false}
  enableHiding={false}

  enableDensityToggle
  enableFullScreenToggle

  enableRowSelection={false}
  enableRowNumbers={false}
  enableColumnResizing
enableColumnActions={false}
enableRowActions={false}
enableCellActions={false}
  enableStickyHeader
  // ✅ FIX IMPORTANT
  muiTableBodyCellProps={{
  sx: { userSelect: "text" },
  onCopy: (e) => {
    e.stopPropagation();
  },
}}

muiTableProps={{
  sx: {
    "& .MuiTableCell-root": {
      userSelect: "text",
    },
  },
}}
/>
    </div>
  );
}