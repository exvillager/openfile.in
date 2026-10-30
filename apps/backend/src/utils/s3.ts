// import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
// import { Upload } from "@aws-sdk/lib-storage";
// import { randomUUIDv7 } from "bun";
// import * as mime from "mime-types";
// import { Readable } from "stream";
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
// import { getFolderByMime } from "./helper";

// const s3 = new S3Client({
//     region: process.env.AWS_REGION,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//     },
//     // bucket: process.env.AWS_BUCKET
// })

// export const uploadFileToS3 = async (
//     file: File,
//     userId: number
// ): Promise<{ url: string; key: string }> => {
//     try {
//         const ext = mime.extension(file.type) || "bin";
//         const folder = getFolderByMime(file.type)
//         const key = `uploads/${folder}/${randomUUIDv7()}.${ext}`;

//         const upload = new Upload({
//             client: s3,
//             params: {
//                 Bucket: process.env.AWS_BUCKET!,
//                 Key: key,
//                 Body: file,
//                 ContentType: file.type
//             }
//         })
//         await upload.done()

//         const url = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

//         return { url, key };
//     } catch (error) {
//         console.error("S3 upload failed:", error)
//         throw new Error("Failed to upload file to S3 " + error?.message);
//     }
// }

// export const uploadStreamToS3 = async (
//     stream: Readable,
//     contentType: string,
//     userId: number
// ): Promise<{ url: string; key: string }> => {
//     try {
//         const ext = mime.extension(contentType) || "bin";
//         const folder = getFolderByMime(contentType)
//         const key = `uploads/${folder}/${randomUUIDv7()}.${ext}`;

//         const upload = new Upload({
//             client: s3,
//             params: {
//                 Bucket: process.env.AWS_BUCKET!,
//                 Key: key,
//                 Body: stream,
//                 ContentType: contentType
//             }
//         })
//         await upload.done()

//         const url = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

//         return { url, key };
//     } catch (error) {
//         console.error("S3 upload failed:", error)
//         throw new Error("Failed to upload file to S3 " + error?.message);
//     }
// }

// export const generateSignedUrl = async (key: string) => {
//     const params = {
//         Bucket: process.env.AWS_BUCKET!,
//         Key: key
//     }

//     const cmd = new GetObjectCommand(params)
//     try {
//         const signedUrl = await getSignedUrl(s3, cmd, { expiresIn: 3600 });
//         return signedUrl;
//     } catch (error) {
//         console.error("Error generating signed URL:", error);
//         throw error;
//     }
// }

// export const generatePresignedUploadUrl = async (mimeType: string)
//     : Promise<{ url: string; key: string }> => {
//     const ext = mime.extension(mimeType) || "bin";
//     const folder = getFolderByMime(mimeType);
//     const key = `uploads/${folder}/${randomUUIDv7()}.${ext}`;

//     const cmd = new PutObjectCommand({
//         Bucket: process.env.AWS_BUCKET!,
//         Key: key,
//         ContentType: mimeType
//     })
//     try {
//         const url = await getSignedUrl(s3, cmd, { expiresIn: 3600 })
//         return { url, key }
//     } catch (error) {
//         console.error("Error generating presigned upload URL:", error);
//         throw error;
//     }
// }

// export function extractS3KeyFromUrl(url: string): string {
//     const parsed = new URL(url);
//     return parsed.pathname.slice(1);
// }

// // export const deleteFilesFromS3 = async (urls: string[]): Promise<boolean> => {
// //     try {
// //         if (urls.length === 0) return;

// //         const objects = urls.map((url) => ({ Key: extractS3KeyFromUrl(url) }))

// //         const res = await s3.send(
// //             new DeleteObjectsCommand({
// //                 Bucket: process.env.AWS_BUCKET!,
// //                 Delete: { Objects: objects }
// //             })
// //         )
// //         if (res.Errors && res.Errors.length > 0) {
// //             console.warn("S3 deletion errors:", res.Errors);
// //             return false;
// //         }

// //         return true;
// //     } catch (error) {
// //         console.log('error while deleting files from s3', error)
// //         return false;
// //     }
// }
