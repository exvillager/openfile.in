import { AuthService } from "@/service/auth.service";
import CleanupService from "@/service/cleanup.service";
import FileService from "@/service/file.service";
import LinkService from "@/service/link.service";
import NotificationService from "@/service/notification.service";
import { deletedFileRepository, fileRepository, linkRepository, userRepository } from "./repositories";
import { cacheService, mailer, storageService } from "./storage";

export const notificationService = NotificationService.getInstance(mailer);
// notificationService.sendWelcomeEmail('teamopenfile@gmail.com')

export const linkService = LinkService.getInstance(
    linkRepository,
  deletedFileRepository,
  cacheService
);

export const fileService = FileService.getInstance(fileRepository, storageService, linkRepository, deletedFileRepository);

export const authService = AuthService.getInstance(notificationService, userRepository);
export const cleanupService = CleanupService.getInstance(
    linkRepository,
    deletedFileRepository,
    fileRepository,
    cacheService
);
