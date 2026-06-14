import { ApiResponse } from "./ApiResponse";
import { request } from "./client";

export type EventLogItem = {
  date: string;
  alertLogTypeId: number;
  alertLogTypeDescription: string;
  detail: string;
  summary: string;
};

export type EventsLogResponse = ApiResponse<EventLogItem[]>;

// GET LAST (legacy GET variant)
export async function getLastEventsLogs(top: number) {
  return request<EventsLogResponse>(
    `/EventsLog/Logs/Get-last?top=${top}`,
    {
      method: "GET",
    }
  );
}

// GET LAST BY TYPES
export async function getLastEventsByTypes(body: { eventTypes: number[]; last: number }) {
  return request<EventsLogResponse>(`/EventsLog/Logs/Get-last`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

// GET BY DATE
export async function getEventsLogsByDate(body: {
  min: string;
  max: string;
}) {
  return request<EventsLogResponse>(
    `/EventsLog/Logs/Get-by-date`,
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}