import { ApiResponse } from "./ApiResponse";
import { request } from "./client";

//
// 🧩 Types
//

export interface SensorType {
  id: number;
  description: string;
}

export interface Sensor {
  id: number;
  active: boolean;
  sensorHardwareRouteId: number;
  type: SensorType;
  pollingTimeInterval: number;
  cellId: number | null;
}

export interface Cell {
  id: number;
  description: string;
  latitude: string;
  longitude: string;
  active: boolean;
  sensors?: Sensor[];
}

export interface SensorPolling {
  sensorHardwareRouteId: number;
  pollingValue: string;
  dateTime: string;
  sensorId: number;
}

export interface CellPolling {
  id: number;
  isActive: boolean;
  description: string;
  sensorsPollings: SensorPolling[];
}

export interface GetCellPollingsDto {
  cellsIds: number[];
  min: string;
  max: string;
  interval: number; // 0=day, 1=week, 2=month, 3=year
}

export type CreateCellDto = {
  description: string;
  latitude: string;
  longitude: string;
  active: boolean;
};

export type UpdateCellDto = {
  id: number;
  description: string;
  latitude: string;
  longitude: string;
  active: boolean;
  sensors: Sensor[];
};

//
// 🧩 Helpers
//

const handleResponse = <T>(
  res: ApiResponse<T>,
  defaultMessage: string
): T => {
  if (!res.success || res.payload === undefined || res.payload === null) {
    throw new Error(res.errors?.join(", ") || defaultMessage);
  }

  return res.payload as T;
};

const handleResponseVoid = (
  res: ApiResponse,
  defaultMessage: string
): void => {
  if (!res.success) {
    throw new Error(res.errors?.join(", ") || defaultMessage);
  }
};

//
// 🚀 Endpoints
//

// 1️⃣ GET /Cell/Get-all
export const getCells = async (): Promise<Cell[]> => {
  const res = await request<ApiResponse<Cell[]>>("/Cell/Get-all");

  return handleResponse(res, "Error fetching cells") ?? [];
};

// 2️⃣ POST /Cell/Get-cell-pollings
export const getCellPollings = async (
  data: GetCellPollingsDto
): Promise<CellPolling[]> => {
  const res = await request<ApiResponse<CellPolling[]>>(
    "/Cell/Get-cell-pollings",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return handleResponse(res, "Error fetching cell pollings") ?? [];
};

// 3️⃣ GET /Cell/Get/Full/{id}
export const getCellFullById = async (
  id: number
): Promise<Cell> => {
  const res = await request<ApiResponse<Cell>>(
    `/Cell/Get/Full/${id}`
  );

  return handleResponse(res, "Cell not found");
};

// 4️⃣ GET /Cell/Get/{id}
export const getCellById = async (
  id: number
): Promise<Cell> => {
  const res = await request<ApiResponse<Cell>>(
    `/Cell/Get/${id}`
  );

  return handleResponse(res, "Cell not found");
};

// Extra helper
export const getCellsFull = async (): Promise<Cell[]> => {
  const cells = await getCells();

  return Promise.all(
    cells.map((cell) => getCellFullById(cell.id))
  );
};

// 5️⃣ POST /Cell/Add
export const createCell = async (
  data: CreateCellDto
): Promise<{
  id: number;
  warnings: string[];
}> => {
  const res = await request<ApiResponse<number>>(
    "/Cell/Add",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return {
    id: handleResponse(res, "Error creating cell"),
    warnings: res.warning ?? [],
  };
};

// 6️⃣ PUT /Cell/Update
export const updateCell = async (data: UpdateCellDto): Promise<void> => {
  const res = await request<ApiResponse>(
    "/Cell/Update",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

  handleResponseVoid(res, "Error updating cell");
};

// 7️⃣ DELETE /Cell/Delete/{id}
export const deleteCell = async (
  id: number
): Promise<void> => {
  const res = await request<ApiResponse>(
    `/Cell/Delete/${id}`,
    {
      method: "DELETE",
    }
  );

  handleResponseVoid(res, "Error updating cell");
};