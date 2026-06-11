import { ApiResponse } from "./ApiResponse";
import { request } from "./client";

export type FiredPollingResponse = ApiResponse;

/**
 * POST /Fired/Polling/SendAndAwaitResponse
 * Body: raw datagram string
 */
export const sendFiredPolling = async (datagram: string) => {
  const res = await fetch(
    "https://fired.runasp.net/Fired/Polling/SendAndAwaitResponse",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datagram),
    }
  );

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
};