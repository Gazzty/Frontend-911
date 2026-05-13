export const BASE_URL = "https://fired.runasp.net";

export const request = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const headers: HeadersInit = {};

  // solo agregar content-type si hay body
  if (options?.body) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Error ${res.status}`);
  }

  return res.json();
};