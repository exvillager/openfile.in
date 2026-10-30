import { useMutation, useQuery } from "@tanstack/react-query";
import type { createLinkArgs } from "types/types";
import { useAuth } from "~/zustand/store";
import axios from "axios";
import { apiFetch, axiosInstance } from "./http";
import { useUploadProgressStore } from "~/zustand/progress-store";
import { useUploadStatusStore } from "~/zustand/upload-status-store";

const backendUrl = import.meta.env.VITE_BACKEND_APP_URL;

// Google OAuth disabled
// export function useGoogleLoginHandler() { ... }

export const signup = async (username: string, password: string) => {
  const res = await fetch(`${backendUrl}/api/v1/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Signup failed");
  useAuth.getState().setUser(data.user);
  return data;
};

export const login = async (username: string, password: string) => {
  const res = await fetch(`${backendUrl}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    credentials: "include",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Login failed");
  useAuth.getState().setUser(data.user);
  return data;
};

export const authCheck = async () => {
  try {
    const res = await apiFetch(`${backendUrl}/api/v1/auth/check`, {
      method: "GET",
    });

    if (!res.ok) {
      useAuth.getState().logout();
      useAuth.getState().setUser(null);
      return;
    }

    const data = await res.json();
    useAuth.getState().setUser(data.user);
  } catch (err) {
    console.error("Login error:", err);
  }
};

export const logout = async () => {
  try {
    const res = await fetch(`${backendUrl}/api/v1/auth/logout`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("Logout failed");
    }

    useAuth.getState().logout();
    useAuth.getState().setUser(null);
  } catch (err) {
    console.error("Logout error:", err);
  }
};

const fetchValidateToken = async (token: string) => {
  const res = await fetch(`${backendUrl}/api/v1/link/validate?token=${token}`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Invalid or expired token");
  }

  return res.json();
};

export function useValidateTokenQuery(token: string) {
  return useQuery({
    queryKey: ["validate-token", token],
    queryFn: () => fetchValidateToken(token),
    enabled: !!token,
    retry: false,
  });
}

const fetchUserLinks = async ({ page = 1, searchQuery = "", limit = 10 }) => {
  const res = await apiFetch(
    `${backendUrl}/api/v1/link?page=${page}&limit=${limit}&query=${searchQuery}`,
    {
      method: "GET",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user links");
  }

  return res.json();
};
export function useUserLinksQuery(page: number, searchQuery: string, limit: number = 10) {
  return useQuery({
    queryKey: ["user-links"],
    queryFn: () => fetchUserLinks({ page, searchQuery, limit }),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

const uploadFiles = async ({ formData, token }: { formData: FormData; token: string }) => {
  const res = await fetch(`${backendUrl}/api/v1/file?token=${token}`, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to upload files");
  }

  return res.json();
};

export function useUploadFilesMutation() {
  return useMutation({
    mutationFn: uploadFiles,
  });
}

const uploadToS3 = async ({
  encryptFile,
  url,
  type,
  name,
}: {
  encryptFile: Blob;
  url: string;
  type: string;
  name: string;
}) => {
  const { updateProgress, updateStatus } = useUploadStatusStore.getState();

  try {
    // const s3Response = await fetch(url, {
    //     method: 'PUT',
    //     headers: {
    //         "Content-Type": type,
    //     },
    //     body: encryptFile
    // })
    // if (!s3Response.ok) {
    //     throw new Error("Failed to upload to S3");
    // }
    // return true

    const res = await axios.put(url, encryptFile, {
      headers: {
        "Content-Type": type,
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent?.total || 1),
        );
        useUploadProgressStore.getState().setProgress(percentCompleted);
        updateProgress(name, percentCompleted);
        updateStatus(name, "uploading");
      },
    });
    if (!(res.status >= 200 && res.status < 300)) {
      throw new Error("Failed to upload to S3");
    }

    return true;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw error;
  }
};

export function useUploadS3Mutation() {
  return useMutation({
    mutationFn: uploadToS3,
  });
}

const fetchUserFiles = async (linkId: string, token: string, page: number, limit: number) => {
  const res = await apiFetch(
    `${backendUrl}/api/v1/file/${linkId}/${token}/files?page=${page}&limit=${limit}`,
    {
      method: "GET",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch user files");
  }

  return res.json();
};

export function useUserFilesQuery(linkId: string, token: string, page: number, limit: number) {
  return useQuery({
    queryKey: ["user-files"],
    queryFn: () => fetchUserFiles(linkId, token, page, limit),
    enabled: !!token,
  });
}

export const getUploadUrl = async (mimeType: string, token: string | null, fileSize: number) => {
  try {
    const res = await fetch(`${backendUrl}/api/v1/file/upload-url?token=${token}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mimeType, fileSize }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "Failed to get upload URL");
    }

    return data;
  } catch (error) {
    console.log("got error during getting upload pre-signed url", error);
    throw error;
  }
};

const updateS3UpoadDB = async ({
  s3Key,
  size,
  token,
  filename,
}: {
  s3Key: string;
  size: number;
  token: string | null;
  filename: string;
}) => {
  try {
    const res = await fetch(`${backendUrl}/api/v1/file/notify-upload?token=${token}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        s3Key,
        fileSize: size,
        name: filename,
      }),
    });
    if (!res.ok) {
      throw new Error("got error while uodating db for s3 upload");
    }
  } catch (error) {
    console.log("got error while uodating db for s3 upload");
    throw error;
  }
};

export const useUpdateS3UploadDB = () => {
  return useMutation({
    mutationFn: updateS3UpoadDB,
  });
};

const createLink = async ({ payload }: createLinkArgs) => {
  try {
    const res = await apiFetch(`${backendUrl}/api/v1/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    if (result.error) {
      console.error("err", result.error);
      throw result.error;
    }
    return result;
  } catch (error) {
    console.log("got error during creating link ");
    throw error;
  }
};

export function useCreateLinkMutation() {
  // const navigate = useNavigate();
  return useMutation({
    mutationFn: createLink,
  });
}

const fetchStorageUsed = async () => {
  try {
    const res = await apiFetch(`${backendUrl}/api/v1/file/storage-used`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch storage used");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching storage used:", error);
    throw error;
  }
};

export function useStorageUsedQuery() {
  return useQuery({
    queryKey: ["storage-used"],
    queryFn: fetchStorageUsed,
    staleTime: Infinity,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

const deleteLink = async (id: number) => {
  try {
    const res = await axiosInstance.delete(`/api/v1/link/${id}`);
    return await res;
  } catch (error: any) {
    console.log("got error during deleting link");
    throw error;
  }
};

export function useDeleteLink() {
  return useMutation({
    mutationFn: deleteLink,
  });
}

const deleteFileFromLink = async ({ linkId, fileId }: { linkId: string; fileId: string }) => {
  try {
    const res = await axiosInstance.delete(`/api/v1/file/${linkId}/files/${fileId}`);
    return await res;
  } catch (error: any) {
    console.log("got error during deleting file");
    throw error;
  }
};

export function useDeleteFileFromLink() {
  return useMutation({
    mutationFn: deleteFileFromLink,
  });
}

const linkCoumt = async () => {
  try {
    const res = await apiFetch(`${backendUrl}/api/v1/link/count`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch link count");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching link count:", error);
    throw error;
  }
};

export function useLinkCount() {
  return useQuery({
    queryKey: ["link-count"],
    queryFn: linkCoumt,
    // staleTime: Infinity,
    gcTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
    retry: false,
  });
}
