import { ContextType, Diesel } from "diesel-core";
import { logger } from "diesel-core/logger";
import { dieselAuthController, dieselMiddleware } from "@/container";
import { authRateLimit } from "@/utils/rate-limit";

export const diesel_auth_router = new Diesel();
diesel_auth_router.useLogger(logger);

diesel_auth_router
  .get("/", (c: ContextType) => {
    //c.setHeader('Content-Type', 'text/plain')
    return c.text("auth route mounted to diesel");
  })
  // .post("/google", dieselAuthController.handleGoogleSignIn)  // OAuth disabled
  .post("/signup", authRateLimit, dieselAuthController.signup)
  .post("/login", authRateLimit, dieselAuthController.login)
  .get("/check", dieselMiddleware.authJwt, dieselAuthController.checkAuth)
  .get("/logout", dieselAuthController.logout)
  .get(
    "/refresh-token",
    dieselMiddleware.fetchUserFromRefreshToken,
    dieselAuthController.refresh_token,
  );
