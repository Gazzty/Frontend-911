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

export interface SensorPolling {
  sensorHardwareRouteId: number;
  pollingValue: string;
  dateTime: string;
  sensorId: number;
}

export interface SensorPollingRequest {
  sensorsIds: number[];
  min: string;
  max: string;
}

export type CreateSensorDto = Omit<Sensor, "id">;
export type UpdateSensorDto = Sensor;

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

// 1️⃣ GET /Sensor/Get/{id}
export const getSensorById = async (id: number): Promise<Sensor> => {
  const res = await request<ApiResponse<Sensor>>(`/Sensor/Get/${id}`);
  return handleResponse(res, "Error fetching sensor");
};

// 2️⃣ GET /Sensor/Get-all
export const getSensors = async (): Promise<Sensor[]> => {
  const res = await request<ApiResponse<Sensor[]>>("/Sensor/Get-all");
  return handleResponse(res, "Error fetching sensors") ?? [];
};

// 3️⃣ POST /Sensor/Add
export const createSensor = async (data: Omit<Sensor, "id">): Promise<number> => {
  const res = await request<ApiResponse<number>>("/Sensor/Add", {
    method: "POST",
    body: JSON.stringify(data),
  });

  return handleResponse(res, "Error creating sensor");
};

// 4️⃣ PUT /Sensor/Update
export const updateSensor = async (data: UpdateSensorDto): Promise<void> => {
  const res = await request<ApiResponse>("/Sensor/Update", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  handleResponseVoid(res, "Error updating sensor");
};

// 5️⃣ DELETE /Sensor/Delete/{id}
export const deleteSensor = async (id: number): Promise<void> => {
  const res = await request<ApiResponse>(`/Sensor/Delete/${id}`, {
    method: "DELETE",
  });

  handleResponseVoid(res, "Error deleting sensor");
};

// 6️⃣ POST /Sensor/Pollings/Get-by-date
export const getSensorPollingsByDate = async (
  data: SensorPollingRequest
): Promise<SensorPolling[]> => {
  const res = await request<ApiResponse<SensorPolling[]>>(
    "/Sensor/Pollings/Get-by-date",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );

  return handleResponse(res, "Error fetching sensor pollings") ?? [];
};