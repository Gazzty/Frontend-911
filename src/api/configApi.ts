import { ApiResponse } from "./ApiResponse";
import { request } from "./client";

//
// 🧩 Tipos
//

export interface SettingDTO {
  code: string;
  summary: string;
  value: string;
}

export interface ConfigGeneral {
  interval: number;
  thresholdTemperature: number;
}

export interface ConfigNotifications {
  email: string;
  emailActive: boolean;
  whatsappNumber: string;
  whatsappActive: boolean;
  smsNumber: string;
  smsActive: boolean;
}

//
// 🌐 Endpoints - Config General
//

// GET /Settings/Get-setting/Config-general
export const getConfigGeneral = async (): Promise<ConfigGeneral> => {
  const res = await request<ApiResponse<SettingDTO>>(
    "/Settings/Get-setting/Config-general"
  );

  if (!res.success || !res.payload) {
    throw new Error(res.errors?.join(", ") || "Error getting config general");
  }

  return JSON.parse(res.payload.value) as ConfigGeneral;
};

// PUT /Settings/Update
export const updateConfigGeneral = async (
  data: ConfigGeneral
): Promise<void> => {
  const dto: SettingDTO = {
    code: "Config-general",
    summary: "Configuración general del sistema",
    value: JSON.stringify(data),
  };

  const res = await request<ApiResponse>("/Settings/Update", {
    method: "PUT",
    body: JSON.stringify(dto),
  });

  if (!res.success) {
    throw new Error(
      res.errors?.join(", ") || "Error updating config general"
    );
  }
};

//
// 🌐 Endpoints - Config Notifications
//

// GET /Settings/Get-setting/Config-notifications
export const getConfigNotifications = async (): Promise<ConfigNotifications> => {
  const res = await request<ApiResponse<SettingDTO>>(
    "/Settings/Get-setting/Config-notifications"
  );

  if (!res.success || !res.payload) {
    throw new Error(
      res.errors?.join(", ") || "Error getting config notifications"
    );
  }

  return JSON.parse(res.payload.value) as ConfigNotifications;
};

// PUT /Settings/Update
export const updateConfigNotifications = async (
  data: ConfigNotifications
): Promise<void> => {
  const dto: SettingDTO = {
    code: "Config-notifications",
    summary: "Configuración de notificaciones",
    value: JSON.stringify(data),
  };

  const res = await request<ApiResponse>("/Settings/Update", {
    method: "PUT",
    body: JSON.stringify(dto),
  });

  if (!res.success) {
    throw new Error(
      res.errors?.join(", ") || "Error updating config notifications"
    );
  }
};
