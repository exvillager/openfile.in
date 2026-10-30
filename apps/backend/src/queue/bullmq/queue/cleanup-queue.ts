import { Queue } from "bullmq";
import { redis } from "../../../config/redis";

export const cleanupQueue = new Queue("cleanup", { connection: redis });

// export async function scheduleCleanupJob() {
//   await cleanupQueue.add(
//     "cleanup-expired-links",
//     {},
//     {
//       repeat: { every: 10 * 60 * 1000 },
//       removeOnComplete: true,
//     }
//   );
// }
