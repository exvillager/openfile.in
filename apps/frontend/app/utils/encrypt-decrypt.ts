import type { FileItem } from "types/types";
import { useFileStatusStore } from "../zustand/fileStatusStore";

export const ENCRYPTION_ALGORITHM = "AES-GCM";
// Links created before the AES-GCM migration used a 16-byte IV (AES-CBC requirement);
// AES-GCM uses a 12-byte IV, so IV length tells us which cipher a given file was encrypted with.
export const LEGACY_ENCRYPTION_ALGORITHM = "AES-CBC";

export const resolveDecryptionAlgorithm = (ivBytes: Uint8Array): string =>
  ivBytes.byteLength === 16 ? LEGACY_ENCRYPTION_ALGORITHM : ENCRYPTION_ALGORITHM;

const toBase64URL = (bytes: Uint8Array): string => {
  const base64 = btoa(String.fromCharCode(...bytes));
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const base64UrlToBase64 = (base64url: string): string => {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return base64;
};

export const generateKeyAndIVWithWebCrypto = async (): Promise<{ key: string; iv: string }> => {
  const key = await crypto.subtle.generateKey(
    {
      name: ENCRYPTION_ALGORITHM,
      length: 256,
    },
    true,
    ["encrypt", "decrypt"],
  );

  const exportedKey = await crypto.subtle.exportKey("raw", key);
  const keyBase64URL = toBase64URL(new Uint8Array(exportedKey));

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ivBase64URL = toBase64URL(iv);

  return { key: keyBase64URL, iv: ivBase64URL };
};

export const encryptFileWithWebCrypto = async (file: File, base64Key: string, base64IV: string) => {
  const keyBytes = Uint8Array.from(atob(base64UrlToBase64(base64Key)), (c) => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(base64UrlToBase64(base64IV)), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: ENCRYPTION_ALGORITHM },
    false,
    ["encrypt"],
  );

  const fileBuffer = await file.arrayBuffer();

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv: ivBytes },
    cryptoKey,
    fileBuffer,
  );

  return new File([encryptedBuffer], file.name, { type: file.type });
};

export const decryptAndDownloadFileWithCrypto = async (
  file: FileItem,
  fileName: string,
  token: string,
  key: string,
  iv: string,
) => {
  const awskey = new URL(file?.url).pathname.slice(1);
  useFileStatusStore.getState().updateFileStatus("getting signed URL..");
  try {
    const download_url = await fetch(
      `${import.meta.env.VITE_BACKEND_APP_URL}/api/v1/file/signed-url?s3key=${awskey}&token=${token}&fileId=${file.id}`,
      {
        credentials: "include",
      },
    );
    useFileStatusStore.getState().updateFileStatus("downloading files...");
    const fileResponse = await download_url.json();

    const s3file = await fetch(fileResponse.data.url);
    if (!s3file.ok) {
      console.warn("file doesn't exists");
      return;
    }
    const encryptedBuffer = await s3file.arrayBuffer();
    useFileStatusStore.getState().updateFileStatus("decrypting files...");

    const base64Key = base64UrlToBase64(key);
    const base64IV = base64UrlToBase64(iv);

    const decryptedBlob = await decryptFileWithWebCrypto(encryptedBuffer, base64Key, base64IV);
    return decryptedBlob;
  } finally {
    useFileStatusStore.getState().updateFileStatus("Decrypt & Download file");
  }
};

export const decryptFileWithWebCrypto = async (
  encryptedData: ArrayBuffer,
  base64Key: string,
  base64IV: string,
): Promise<Blob> => {
  const worker = new Worker(new URL("./decryptWorker.ts", import.meta.url), { type: "module" });

  const decryptWithWorker = (): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
      worker.onmessage = (event) => {
        if (event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data.decryptedBuffer);
        }
        worker.terminate();
      };

      worker.onerror = (err) => {
        reject("Worker error: " + err.message);
        worker.terminate();
      };

      worker.postMessage({ base64Key, base64IV, encryptedData });
    });
  };

  const decryptedBuffer = await decryptWithWorker();
  return new Blob([decryptedBuffer]);
};
