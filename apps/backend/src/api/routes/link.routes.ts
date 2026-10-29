import { Diesel } from "diesel-core";
import { logger } from "diesel-core/logger";
import { diesel_link_controller, dieselMiddleware } from "@/container";

export const diesel_link_router = new Diesel();
diesel_link_router.useLogger(logger);

diesel_link_router
  .get("/", dieselMiddleware.fetchUserLinks, diesel_link_controller.getUserLinks)
  .get("/count", dieselMiddleware.fetchUser, diesel_link_controller.getLinksCount)
  .get("/validate", diesel_link_controller.validateLink)
  .post("/", dieselMiddleware.authJwt, diesel_link_controller.generateLink)
  .delete("/:id", dieselMiddleware.fetchLinkWithUser, diesel_link_controller.deleteLink);
