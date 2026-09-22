// /src/services/s3.service.ts

import {
    DeleteObjectsCommand,
    GetObjectCommand,
    PutObjectCommand,
    S3Client
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getKey } from "../utils/helper";
import { extractKeyFromUrl, IStorage } from "../interface/storage.interface";
import { UPLOAD_URL_TTL } from "../../constant";

export class S3Service implements IStorage {
    private client: S3Client;
    private bucket: string;
    private static instance: S3Service
    instanceName: string

    constructor() {
        this.client = new S3Client({
            region: process.env.AWS_REGION!,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
        this.bucket = process.env.AWS_BUCKET!;
        this.instanceName = 's3'
    }

    public static getInstance() {
        if (!S3Service.instance) {
            S3Service.instance = new S3Service()
        }
        return S3Service.instance
    }

    name(): string {
        return this.instanceName
    }

    getObjectUrl(key: string): string {
        return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

    public async uploadFile(file: File) {
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

    public async uploadStream(stream: Readable, contentType: string) {
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

    public async generateSignedDownloadUrl(key: string) {
        const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
        return await getSignedUrl(this.client as any, cmd, { expiresIn: 3600 });
    }

    public async generatePresignedUploadUrl(mimeType: string) {
        try {
            const key = getKey(mimeType);
            const cmd = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                ContentType: mimeType,
            });
            const url = await getSignedUrl(this.client as any, cmd, { expiresIn: UPLOAD_URL_TTL });
            return { url, key };
        } catch (error) {
            console.error("Error generating presigned upload URL:", error);
        }
    }


    deleteFiles = async (files: { id: string, url: string }[]) => {
        console.log('called s3 deleted method ', this.name());
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
            console.log("error while deleting files from s3", error);
            return false;
        }
    }
}


