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

// GET LAST
export async function getLastEventsLogs(top: number) {
  return request<EventsLogResponse>(
    `/EventsLog/Logs/Get-last?top=${top}`,
    {
      method: "GET",
    }
  );
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