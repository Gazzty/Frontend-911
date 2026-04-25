import { ApiResponse } from "./ApiResponse";
import { request } from "./client";

//
// 🧩 Tipos
//

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

// 1) GET /Config/Get/Config-general
export const getConfigGeneral = async (): Promise<ConfigGeneral> => {
  const res = await request<ApiResponse<ConfigGeneral>>(
    "/Config/Get/Config-general"
  );

  if (!res.success || !res.payload) {
    throw new Error(res.errors?.join(", ") || "Error getting config general");
  }

  return res.payload;
};

// 2) PUT /Config/Update/Config-general
export const updateConfigGeneral = async (
  data: ConfigGeneral
): Promise<void> => {
  const res = await request<ApiResponse>("/Config/Update/Config-general", {
    method: "PUT",
    body: JSON.stringify(data),
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

// 3) GET /Config/Get/Config-notifications
export const getConfigNotifications = async (): Promise<ConfigNotifications> => {
  const res = await request<ApiResponse<ConfigNotifications>>(
    "/Config/Get/Config-notifications"
  );

  if (!res.success || !res.payload) {
    throw new Error(
      res.errors?.join(", ") || "Error getting config notifications"
    );
  }

  return res.payload;
};

// 4) PUT /Config/Update/Config-notifications
export const updateConfigNotifications = async (
  data: ConfigNotifications
): Promise<void> => {
  const res = await request<ApiResponse>("/Config/Update/Config-notifications", {
    method: "PUT",
    body: JSON.stringify(data),
  });

  if (!res.success) {
    throw new Error(
      res.errors?.join(", ") || "Error updating config notifications"
    );
  }
};