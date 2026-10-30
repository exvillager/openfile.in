import * as Crypto from "expo-crypto";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as aesjs from "aes-js";
import { API_URL } from "../constant";

const toBase64URL = (bytes: Uint8Array): string => {
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

const base64URLToBytes = (str: string): Uint8Array => {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  return new Uint8Array(Array.from(binary, (c) => c.charCodeAt(0)));
};

// const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
//     const bytes = new Uint8Array(buffer)
//     let binary = ''
//     bytes.forEach((b) => (binary += String.fromCharCode(b)))
//     return btoa(binary)
// }

const uint8ArrayToBase64 = (bytes: Uint8Array): string => {
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
};

export const generateKeyAndIV = (): { key: string; iv: string } => {
  const keyBytes = Crypto.getRandomBytes(32);
  const ivBytes = Crypto.getRandomBytes(16);
  return { key: toBase64URL(keyBytes), iv: toBase64URL(ivBytes) };
};

const getSignedUrl = async (fileUrl: string, fileId: string, token: string): Promise<string> => {
  const s3key = new URL(fileUrl).pathname.slice(1);
  const res = await fetch(
    `${API_URL}/api/v1/file/signed-url?s3key=${s3key}&token=${token}&fileId=${fileId}`,
    { credentials: "include" },
  );
  const data = await res.json();
  return data.data.url;
};

const decryptBytes = async (
  fileUrl: string,
  fileId: string,
  token: string,
  keyStr: string,
  ivStr: string,
): Promise<Uint8Array> => {
  const signedUrl = await getSignedUrl(fileUrl, fileId, token);

  const response = await fetch(signedUrl);
  const encryptedBuffer = await response.arrayBuffer();
  const encryptedBytes = new Uint8Array(encryptedBuffer);

  const key = base64URLToBytes(keyStr);
  const iv = base64URLToBytes(ivStr);

  const aesCbc = new aesjs.ModeOfOperation.cbc(Array.from(key), Array.from(iv));
  const decrypted = aesCbc.decrypt(encryptedBytes);

  // Remove PKCS7 padding
  const padLength = decrypted[decrypted.length - 1];
  return decrypted.slice(0, decrypted.length - padLength);
};

export const decryptAndSave = async (
  fileUrl: string,
  fileId: string,
  token: string,
  fileName: string,
  keyStr: string,
  ivStr: string,
): Promise<void> => {
  const decrypted = await decryptBytes(fileUrl, fileId, token, keyStr, ivStr);
  const base64 = uint8ArrayToBase64(decrypted);
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!cacheDir) throw new Error("No writable directory available");
  const localUri = cacheDir + safeFileName;
  await FileSystem.writeAsStringAsync(localUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) throw new Error("Sharing is not available on this device");
  await Sharing.shareAsync(localUri, { dialogTitle: `Save ${fileName}` });
};

export const decryptToLocalUri = async (
  fileUrl: string,
  fileId: string,
  token: string,
  fileName: string,
  keyStr: string,
  ivStr: string,
): Promise<string> => {
  const decrypted = await decryptBytes(fileUrl, fileId, token, keyStr, ivStr);
  const base64 = uint8ArrayToBase64(decrypted);
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const cacheDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!cacheDir) throw new Error("No writable directory available");
  const localUri = cacheDir + safeFileName;
  await FileSystem.writeAsStringAsync(localUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return localUri;
};

export const decryptToBase64 = async (
  fileUrl: string,
  fileId: string,
  token: string,
  fileName: string,
  keyStr: string,
  ivStr: string,
): Promise<string> => {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const mimeMap: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    heic: "image/heic",
  };
  const mime = mimeMap[ext] ?? "application/octet-stream";
  const decrypted = await decryptBytes(fileUrl, fileId, token, keyStr, ivStr);
  return `data:${mime};base64,` + uint8ArrayToBase64(decrypted);
};
