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
// 🌐 Generic Endpoints
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

//
// 🧩 Specific Helpers
//

// ================= TEMP MAX =================

// export const createTempMax = async (
//   value: string
// ): Promise<void> => {
//   await addSetting({
//     code: "TempMax",
//     summary: "Temperatura umbral de alerta (°C)",
//     value,
//   });
// };

export const updateTempMax = async (
  value: string
): Promise<void> => {
  await updateSetting({
    code: "TempMax",
    summary: "Temperatura umbral de alerta (°C)",
    value,
  });
};

// ================= POLLING =================

// export const createPollingInterval = async (
//   value: string
// ): Promise<void> => {
//   await addSetting({
//     code: "IntervalPollingDefault",
//     summary: "Intervalo de medición de sensores (segundos)",
//     value,
//   });
// };

export const updatePollingInterval = async (
  value: string
): Promise<void> => {
  await updateSetting({
    code: "IntervalPollingDefault",
    summary: "Intervalo de medición de sensores (segundos)",
    value,
  });
};

// ================= EMAILS =================

// export const createEmails = async (
//   value: string
// ): Promise<void> => {
//   await addSetting({
//     code: "Emails",
//     summary: "Dirección de email para notificaciones",
//     value,
//   });
// };

export const updateEmails = async (
  value: string
): Promise<void> => {
  await updateSetting({
    code: "Emails",
    summary: "Dirección de email para notificaciones",
    value,
  });
};

// ================= EMAIL NOTIFICATIONS =================

// export const createEmailNotifications = async (
//   value: string
// ): Promise<void> => {
//   await addSetting({
//     code: "EmailsNotification",
//     summary: "Notificaciones por email activadas",
//     value,
//   });
// };

export const updateEmailNotifications = async (
  value: string
): Promise<void> => {
  await updateSetting({
    code: "EmailsNotification",
    summary: "Notificaciones por email activadas",
    value,
  });
};

// ================= SMS =================

// export const createSMSNotifications = async (
//   value: string
// ): Promise<void> => {
//   await addSetting({
//     code: "SMSNotification",
//     summary: "Notificaciones por SMS activadas",
//     value,
//   });
// };

export const updateSMSNotifications = async (
  value: string
): Promise<void> => {
  await updateSetting({
    code: "SMSNotification",
    summary: "Notificaciones por SMS activadas",
    value,
  });
};

// ================= PHONE =================

// export const createPhoneNumber = async (
//   value: string
// ): Promise<void> => {
//   await addSetting({
//     code: "PhoneNumber",
//     summary: "Número de teléfono para notificaciones",
//     value,
//   });
// };

export const updatePhoneNumber = async (
  value: string
): Promise<void> => {
  await updateSetting({
    code: "PhoneNumber",
    summary: "Número de teléfono para notificaciones",
    value,
  });
};