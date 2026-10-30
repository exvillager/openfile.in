import {
  base64UrlToBase64,
  ENCRYPTION_ALGORITHM,
  LEGACY_ENCRYPTION_ALGORITHM,
  resolveDecryptionAlgorithm,
} from "./encrypt-decrypt";

const tryDecrypt = async (algorithm: string, keyBytes: any, ivBytes: any, encryptedData: any) => {
  const cryptoKey = await crypto.subtle.importKey("raw", keyBytes, { name: algorithm }, false, [
    "decrypt",
  ]);
  return crypto.subtle.decrypt({ name: algorithm, iv: ivBytes }, cryptoKey, encryptedData);
};

self.onmessage = async (e) => {
  const { base64Key, base64IV, encryptedData } = e.data;

  try {
    const keyBytes = Uint8Array.from(atob(base64UrlToBase64(base64Key)), (c) => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(base64UrlToBase64(base64IV)), (c) => c.charCodeAt(0));

    // A link's key/IV can be reused across an old and new upload, so IV length
    // alone doesn't reliably tell us which cipher a given file was encrypted
    // with. Try the length-inferred guess first, then fall back to the other.
    const primary = resolveDecryptionAlgorithm(ivBytes);
    const fallback =
      primary === ENCRYPTION_ALGORITHM ? LEGACY_ENCRYPTION_ALGORITHM : ENCRYPTION_ALGORITHM;

    let decryptedBuffer: ArrayBuffer;
    try {
      decryptedBuffer = await tryDecrypt(primary, keyBytes, ivBytes, encryptedData);
    } catch {
      decryptedBuffer = await tryDecrypt(fallback, keyBytes, ivBytes, encryptedData);
    }

    self.postMessage({ decryptedBuffer });
  } catch (error) {
    self.postMessage({ error: error?.message || "Unknown decryption error" });
  }
};
