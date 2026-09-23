import { Readable } from "stream"

export interface IStorage {
    name(): string
    
    uploadFile(file: File): Promise<{
        url: string;
        key: string;
    }>
    
    uploadStream(stream: Readable, contentType: string): Promise<{
        url: string;
        key: string;
    }>
    
    generateSignedDownloadUrl(key: string): Promise<string>
    
    generatePresignedUploadUrl(mimeType: string, fileSize: number): Promise<{
        url: string;
        key: string;
    } | undefined>

    /** Public object URL for a key. The inverse of extractKeyFromUrl(). */
    getObjectUrl(key: string): string
    
    deleteFiles(files: { id: string, url: string }[]): Promise<boolean | undefined>
}


export function extractKeyFromUrl(url: string) {
    const parsed = new URL(url);
    return parsed.pathname.slice(1);
}