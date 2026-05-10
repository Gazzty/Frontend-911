import { ApiResponse } from "./ApiResponse";
import { request } from "./client";

//
// 🧩 Tipos base
//

export interface Sensor {
  id?: number;
  active: boolean;
  sensorHardwareRouteId: number;
  type: { id: number; description: string };
  pollingTimeInterval: number;
}

export interface Cell {
  id: number;
  description: string;
  sensors: Sensor[];
  latitude: string;
  longitude: string;
  active: boolean;
}

export type CreateCellDto = Omit<Cell, "id">;
export type UpdateCellDto = Cell;

//
// Endpoints
//

// 1) GET /Cell/Get-all
export const getCells = async (): Promise<Cell[]> => {
  const res = await request<ApiResponse<Cell[]>>("/Cell/Get-all");

  if (!res.success) {
    throw new Error(res.errors?.join(", ") || "Error fetching cells");
  }

  return res.payload ?? [];
};

// 2a) GET /Cell/Get/Full/{id} — incluye sensores con su tipo
export const getCellFullById = async (id: number): Promise<Cell> => {
  const res = await request<ApiResponse<Cell>>(`/Cell/Get/Full/${id}`);

  if (!res.success || !res.payload) {
    throw new Error(res.errors?.join(", ") || "Cell not found");
  }

  return res.payload;
};

// GET /Cell/Get-all + Full por cada celda — trae todas las celdas con sus sensores
export const getCellsFull = async (): Promise<Cell[]> => {
  const cells = await getCells();
  return Promise.all(cells.map((c) => getCellFullById(c.id)));
};

// 2) GET /Cell/Get/{id}
export const getCellById = async (id: number): Promise<Cell> => {
  const res = await request<ApiResponse<Cell>>(`/Cell/Get/${id}`);

  if (!res.success || !res.payload) {
    throw new Error(res.errors?.join(", ") || "Cell not found");
  }

  return res.payload;
};

// 3) POST /Cell/Add
// devuelve payload: number (el id creado)
export const createCell = async (data: CreateCellDto): Promise<number> => {
  const res = await request<ApiResponse<number>>("/Cell/Add", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.success || res.payload === undefined) {
    throw new Error(res.errors?.join(", ") || "Error creating cell");
  }

  return res.payload;
};

// 4) PUT /Cell/Update
// NO devuelve payload
export const updateCell = async (data: UpdateCellDto): Promise<void> => {
  const res = await request<ApiResponse>("/Cell/Update", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!res.success) {
    throw new Error(res.errors?.join(", ") || "Error updating cell");
  }
};

// 5) DELETE /Cell/Delete/{id}
// export const deleteCell = async (id: number): Promise<void> => {
//   const res = await request<ApiResponse>(`/Cell/Delete/${id}`, {
//     method: "DELETE",
//   });

//   if (!res.success) {
//     throw new Error(res.errors?.join(", ") || "Error deleting cell");
//   }
// };
export const deleteCell = async (id: number): Promise<void> => {
  const res = await request<ApiResponse>(`/Cell/Delete/${id}`, {
    method: "DELETE",
  });

  // ⚠️ Backend bug: devuelve success=false aunque borra correctamente
  if (!res.success && res.errors && res.errors.length > 0) {
    throw new Error(res.errors.join(", "));
  }

  // Si success=false pero no hay errores → asumimos OK
};