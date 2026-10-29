// import { getUploadUrl, useUpdateS3UploadDB, useUploadS3Mutation } from "~/service/api";

// const { mutateAsync: uploadFilesMutation, isPending: isUploading } = useUploadS3Mutation();
// const { mutateAsync: UpdateDbS3 } = useUpdateS3UploadDB();

export const encryptFileWithWorker = (file: File, secretKey: string, iv: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("../../utils/encryptWorker.ts", import.meta.url), {
      type: "module",
    });
    worker.onmessage = (event) => {
      worker.terminate();
      event.data.error ? reject(event.data.error) : resolve(event.data);
    };
    worker.onerror = (err) => {
      worker.terminate();
      reject("Worker error: " + err.message);
    };
    worker.postMessage({ file, secretKey, iv });
  });
};

// const uploadSingleFile = async (file: File, fileStatusList: File[], key: string, iv: string, token: string, updateStatus: any, setError: any) => {

//   const status: any = fileStatusList.find((f: any) => f.name === file.name);
//   if (status?.status === "done") return;

//   try {
//     const mimeType = file.type || 'application/octet-stream';
//     const { url, key: s3Key } = await getUploadUrl(mimeType, token, file.size);
//     const encryptedBlob = await encryptFileWithWorker(file, key, iv);
//     const encryptedFile = new File([encryptedBlob], file.name, { type: file.type });

//     await uploadFilesMutation({ encryptFile: encryptedBlob, type: mimeType, url, name: file.name });
//     await UpdateDbS3({ s3Key, size: encryptedFile.size, token, filename: file.name });

//     updateStatus(file.name, "done");
//   } catch (error) {
//     const message = error instanceof Error ? error.message : String(error);
//     setError(file.name, message ?? "error while upload this file");
//     throw error;
//   }
// };

// export const parallerUpload = async (files:File[], fileStatusList: File[], key: string, iv: string, token: string, updateStatus: any, setError: any) => {
//   const uploadPromises = files.map(file => uploadSingleFile(file,).catch(e => e));
//     await Promise.all(uploadPromises);
// }

export const getHashParams = (hash: string) => {
  const hashParams = new URLSearchParams(hash.slice(1));
  return {
    key: hashParams.get("key") || "",
    iv: hashParams.get("iv") || "",
  };
};
