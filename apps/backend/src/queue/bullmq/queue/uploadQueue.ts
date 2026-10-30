import { Queue } from "bullmq";
import { redis } from "../../../config/redis";

export const uploadQueue = new Queue("uploadQueue", { connection: redis });

export interface UploadJob {
  userId: number;
  linkId: number;
  filename: string;
  socketId: string;
  size: number;
}
