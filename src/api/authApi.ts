import { axiosClient } from "./axiosClient";

export async function loginRequest(credentials: { email: string; password: string }) {
  const res = await axiosClient.post("/api/auth/login", credentials);
  return res.data;
}

export async function refreshRequest(refreshToken: string) {
  const res = await axiosClient.post("/api/auth/refresh", { refreshToken });
  return res.data;
}
