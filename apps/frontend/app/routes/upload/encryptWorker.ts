import { encryptFileWithWebCrypto } from "~/utils/encrypt-decrypt";

self.onmessage = async function (e) {
  const { file, secretKey, iv } = e.data;

  try {
    const encryptedBlob = await encryptFileWithWebCrypto(file, secretKey, iv);
    self.postMessage(encryptedBlob);
  } catch (err) {
    self.postMessage({ error: err?.message || "Encryption failed" });
  }
};
