export interface LinkItem {
  id: string;
  iv: string;
  name?: string;
  maxUploads: number;
  secretKey: number;
  token: string;
  uploadCount: number;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface FileItem {
  createdAt: string;
  id: string;
  name: string;
  iv: string;
  keyUsed: boolean;
  size: number;
  updatedAt: string;
  uploadLinkId: string;
  url: string;
  userId: string;
}

export interface createLinkArgs {
  payload: CreateLinkPayload;
  secretKey: string;
  iv: string;
}

export interface CreateLinkPayload {
  maxUploads: number;
  allowedFileType?: string[];
  expiresAt?: string;
}
