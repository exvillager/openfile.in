import { useMutation } from "@tanstack/react-query";
import { API_URL } from "../constant";
import { useAuth } from "../zustand/user-store";

export const login = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Login failed");
  useAuth.getState().setUser(data.user);
  return data;
};

export function useLogin() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
  });
}

export const register = async (username: string, password: string) => {
  const res = await fetch(`${API_URL}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Registration failed");
  useAuth.getState().setUser(data.user);
  return data;
};

export function useRegister() {
  return useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      register(username, password),
  });
}

const delete_file = async ({
  link_id,
  file_id,
}: {
  link_id: string;
  file_id: string;
}): Promise<void> => {
  const res = await fetch(`${API_URL}/api/v1/file/${link_id}/files/${file_id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Couldn't delete the file.");
};

export function useDeleteFile() {
  return useMutation({
    mutationFn: (payload: { link_id: string; file_id: string }) => delete_file(payload),
  });
}
