import { get, set, del } from "idb-keyval";

export async function saveCryptoSecret(token: string, data: { key: string; iv: string }) {
  await set(`crypto:${token}`, data);
}

export async function getCryptoSecret(token: string): Promise<{ key: string; iv: string } | null> {
  const data = await get(`crypto:${token}`);
  return data || null;
}

export async function deleteCryptoSecret(token: string) {
  await del(`crypto:${token}`);
}
