import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import { Alert } from "react-native";
import { API_URL } from "../constant";

function checkUnauthorized(res: Response) {
  if (res.status === 403) {
    Alert.alert("Unauthorized", "You're not authorized to do this.");
  }
}

export interface Link {
  id: string;
  name?: string;
  token: string;
  maxUploads: number;
  uploadCount: number;
  expiresAt: string;
  expireAfterFirstUpload: boolean;
  createdAt: string;
  isActive: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  url: string;
  mimeType?: string;
  createdAt: string;
}

interface CreateLinkPayload {
  name?: string;
  maxUploads: number;
  expiresAt: string;
  expireAfterFirstUpload: boolean;
  iv: string;
}

interface CreateLinkResponse {
  token: string;
}

export const createLink = async (payload: CreateLinkPayload): Promise<CreateLinkResponse> => {
  const res = await fetch(`${API_URL}/api/v1/link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  checkUnauthorized(res);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to create link");
  return data;
};

export function useCreateLink() {
  return useMutation({
    mutationFn: (payload: CreateLinkPayload) => createLink(payload),
  });
}

const getUserLinks = async (page: number, search: string, limit: number) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    query: search,
  });
  const res = await fetch(`${API_URL}/api/v1/link?${params}`, {
    method: "GET",
    credentials: "include",
  });
  checkUnauthorized(res);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch links");
  return data as { data: Link[]; page: number; limit: number };
};

export function useUserLinksQuery(search: string, limit: number) {
  return useInfiniteQuery({
    queryKey: ["links", search],
    queryFn: ({ pageParam }) => getUserLinks(pageParam, search, limit),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.data.length === limit ? lastPage.page + 1 : undefined,
  });
}

export function useLinkCount() {
  return useQuery({
    queryKey: ["linkCount"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/v1/link/count`, {
        credentials: "include",
      });
      checkUnauthorized(res);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error);
      return data as { links: number };
    },
  });
}

const fetchStorageUsed = async () => {
  try {
    const res = await fetch(`${API_URL}/api/v1/file/storage-used`, {
      method: "GET",
      credentials: "include",
    });
    if (!res.ok) {
      throw new Error("Failed to fetch storage used");
    }
    return await res.json();
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

interface GetUserFilesParams {
  link_id: string;
  token: string;
  page: number;
  limit: number;
}

const getUserFiles = async ({ link_id, token, page, limit }: GetUserFilesParams) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  const res = await fetch(`${API_URL}/api/v1/file/${link_id}/${token}/files?${params}`, {
    method: "GET",
    credentials: "include",
  });
  checkUnauthorized(res);
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error("Failed to fetch files: server returned an unexpected response");
  }
  if (!res.ok) throw new Error(data?.error || "Failed to fetch files");
  return data as { data: FileItem[]; page: number };
};

export function useUserFilesQuery(link_id: string, token: string, limit: number) {
  return useInfiniteQuery({
    queryKey: ["files", link_id, token],
    queryFn: ({ pageParam }) => getUserFiles({ link_id, token, page: pageParam, limit }),
    initialPageParam: 1,
    enabled: !!link_id && !!token,
    getNextPageParam: (lastPage) =>
      lastPage.data.length === limit ? lastPage.page + 1 : undefined,
  });
}

const deleteLinkById = async (id: string) => {
  const res = await fetch(`${API_URL}/api/v1/link/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  checkUnauthorized(res);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || "Failed to delete link");
  }
};

export function useDeleteLink() {
  return useMutation({
    mutationFn: (id: string) => deleteLinkById(id),
  });
}
