import { IpQueue } from "../queue/bullmq/queue/ip-queue";
import { Ip } from "../../type";

export const pushIpToQueue = async ({ ip, purpose, fileId, linkId }: Ip) => {
  await IpQueue.add("ip-queue", {
    ip,
    purpose,
    fileId,
    linkId,
  });
  // console.log("pushed to queue", ip, purpose, fileId, linkId);
};
