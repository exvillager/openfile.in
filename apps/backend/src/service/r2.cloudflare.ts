import { Readable } from "stream";
import { extractKeyFromUrl, IStorage } from "../interface/storage.interface";
import { DeleteObjectsCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getKey } from "../utils/helper";
import { Upload } from "@aws-sdk/lib-storage";
import { UPLOAD_URL_TTL } from "../../constant";


export class R2StorageService implements IStorage {
    private client: any;

    private static instance: R2StorageService
    Instancename: string

    constructor(private bucket: string, accountId: string, accessKey: string, secretKey: string) {
        this.client = new S3Client({
            region: "auto",  // cloudflare needs auto
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
        });
        this.Instancename = 'r2'
    }

    public static getInstance(bucket: string, accountId: string, accessKey: string, secretKey: string) {
        if (!R2StorageService.instance) {
            R2StorageService.instance = new R2StorageService(bucket, accountId, accessKey, secretKey)
        }
        return R2StorageService.instance
    }

    name(): string {
        return this.Instancename
    }

    // NOTE: this deliberately keeps the S3-shaped host every File row in the DB
    // already uses. Only the path matters -- extractKeyFromUrl() reads the key
    // back off it, and that is what deletes are issued against.
    getObjectUrl(key: string): string {
        return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

    async generateSignedDownloadUrl(key: string) {
        const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key })
        return await getSignedUrl(this.client, cmd, { expiresIn: 3600 })
    }

    async generatePresignedUploadUrl(mimeType: string, fileSize: number) {
        const key = getKey(mimeType);
        const cmd = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: mimeType,
            ContentLength: fileSize,
        });
        // Signing content-length pins the upload to exactly fileSize bytes; any
        // other body size fails the signature check and the PUT is rejected.
        const url = await getSignedUrl(this.client, cmd, {
            expiresIn: UPLOAD_URL_TTL,
            signableHeaders: new Set(["content-length", "content-type"]),
        });

        return { url, key };
    }

    async uploadFile(file: File) {
        const key = getKey(file.type);
        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: file,
                ContentType: file.type,
            },
        });
        await upload.done();
        return { url: this.getObjectUrl(key), key };
    }

    async uploadStream(stream: Readable, contentType: string) {
        const key = getKey(contentType);
        const upload = new Upload({
            client: this.client,
            params: {
                Bucket: this.bucket,
                Key: key,
                Body: stream,
                ContentType: contentType,
            },
        });
        await upload.done();
        return { url: this.getObjectUrl(key), key };
    }

    async deleteFiles(files: { id: string, url: string }[]) {
        // console.log("called r2 delete ", this.name())
        // console.log(files)

        if (files.length === 0) return;

        const objects = files.map((f) => ({
            Key: extractKeyFromUrl(f.url),
        }));

        try {
            const res = await this.client.send(
                new DeleteObjectsCommand({
                    Bucket: this.bucket,
                    Delete: { Objects: objects },
                })
            );

            if (res.Errors && res.Errors.length > 0) {
                console.warn("S3 deletion errors:", res.Errors);
                return false;
            }
            return true;
        } catch (error) {
            console.log("error while deleting files from R2", error);
            return false;
        }
    }

}