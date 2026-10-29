import { Worker } from "bullmq";
import { cleanupExpiredLinks } from "../../../utils/cleanupExpiredLinks";
import { redis } from "../../../config/redis";

// new Worker('cleanup', async () => {
//     await cleanupExpiredLinks()
// },{connection:redis})
