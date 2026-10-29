import { DieselAuthController } from "@/api/controller/auth.controller";
import DieselFileController from "@/api/controller/file.controller";
import DieselLinkController from "@/api/controller/link.controller";
import { DieselMiddlewares } from "@/api/middleware";
import { linkRepository, userRepository } from "./repositories";
import { authService, fileService, linkService } from "./services";
import { cacheService } from "./storage";

export const dieselAuthController = DieselAuthController.getInstance(authService);
export const dieselMiddleware = DieselMiddlewares.getInstance(
  userRepository,
  linkRepository,
  cacheService,
);
export const diesel_file_controller = DieselFileController.getInstance(fileService as any); // will solve ts err
export const diesel_link_controller = DieselLinkController.getInstance(linkService);
