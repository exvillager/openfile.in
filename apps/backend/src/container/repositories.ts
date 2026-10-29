import { CONFIG } from "@/config";
import { createDBClient } from "@/config/db";
import { IDeleteFileRepo } from "@/interface/delete-file.interface";
import { IFileRepo } from "@/interface/file.interface";
import { ILinkRepo } from "@/interface/link.interface";
import { ISubscriptionRepo } from "@/interface/subsc.interface";
import { IUserRepository } from "@/interface/user.interface";
import { DeletedFileRepositoryDrizzle } from "@/repository/drizzle-repo/deleted.file.drizzle";
import { FileRepositoryDrizzle } from "@/repository/drizzle-repo/file.drizzle";
import { LinkRepositoryDrizzle } from "@/repository/drizzle-repo/link.drizzle";
import { SubscriptionRepositoryDrizzle } from "@/repository/drizzle-repo/subscription.drizzle";
import UserRepositoryDrizzle, { DrizzleClient } from "@/repository/drizzle-repo/user.drizzle";

type RepositoryName = "link" | "deleted_file" | "user" | "file" | "subscription";

export function createRepository(
  repositoryName: RepositoryName,
  dbType?: string,
): ILinkRepo | IUserRepository | IFileRepo | IDeleteFileRepo | ISubscriptionRepo {
  const clientType = CONFIG.DB_CLIENT || dbType;
  const client = createDBClient(clientType as any);

  switch (repositoryName) {
    case "link":
      if (clientType === "drizzle")
        return LinkRepositoryDrizzle.getInstance(client as DrizzleClient) as ILinkRepo;
    // return LinkRepository.getInstance(client as PrismaClient);
    case "deleted_file":
      if (clientType === "drizzle")
        return DeletedFileRepositoryDrizzle.getInstance(client as DrizzleClient) as IDeleteFileRepo;
    // return DeletedFileRepository.getInstance(client as PrismaClient);
    case "user":
      if (clientType === "drizzle")
        return UserRepositoryDrizzle.getInstance(client as DrizzleClient) as IUserRepository;
    // return UserRepository.getInstance(client as PrismaClient);
    case "file":
      if (clientType === "drizzle")
        return FileRepositoryDrizzle.getInstance(client as DrizzleClient) as IFileRepo;
    // return FileRepository.getInstance(client as PrismaClient);
    case "subscription":
      if (clientType === "drizzle")
        return SubscriptionRepositoryDrizzle.getInstance(
          client as DrizzleClient,
        ) as ISubscriptionRepo;
    // return SubscriptionRepository.getInstance(client as PrismaClient) as ISubscriptionRepo;

    default:
      throw new Error(`Repository ${repositoryName} not found`);
  }
}

// Repositories DB
// now we have fully migrated to drizzle.
export const linkRepository = createRepository("link") as ILinkRepo;
export const userRepository = createRepository("user") as IUserRepository;
export const subscriptionRepository = createRepository("subscription") as ISubscriptionRepo;
export const fileRepository = createRepository("file") as IFileRepo;
export const deletedFileRepository = createRepository("deleted_file") as IDeleteFileRepo;
