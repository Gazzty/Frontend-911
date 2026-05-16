import { ApiResponse } from "./ApiResponse";
import { request } from "./client";

//
// 🧩 Types
//

export interface SettingDTO {
  code: string;
  summary: string;
  value: string;
}

//
// 🧩 Helpers
//

const handleResponse = <T>(
  res: ApiResponse<T>,
  defaultMessage: string
): T => {
  if (!res.success) {
    throw new Error(res.errors?.join(", ") || defaultMessage);
  }

  return res.payload as T;
};

//
// 🌐 Endpoints
//

// 1️⃣ GET /Settings/Get-all
export const getAllSettings = async (): Promise<SettingDTO[]> => {
  const res = await request<ApiResponse<SettingDTO[]>>(
    "/Settings/Get-all"
  );

  return handleResponse(res, "Error fetching settings") ?? [];
};

// 2️⃣ GET /Settings/Get-setting/{code}
export const getSetting = async (
  code: string
): Promise<SettingDTO> => {
  const res = await request<ApiResponse<SettingDTO>>(
    `/Settings/Get-setting/${code}`
  );

  return handleResponse(res, `Error fetching setting ${code}`);
};

// 3️⃣ PUT /Settings/Add
export const addSetting = async (
  data: SettingDTO
): Promise<void> => {
  const res = await request<ApiResponse>(
    "/Settings/Add",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

  handleResponse(res, "Error adding setting");
};

// 4️⃣ PUT /Settings/Update
export const updateSetting = async (
  data: SettingDTO
): Promise<void> => {
  const res = await request<ApiResponse>(
    "/Settings/Update",
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );

  handleResponse(res, "Error updating setting");
};

