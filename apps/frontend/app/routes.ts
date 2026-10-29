import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/about", "routes/about.tsx"),
  route("/contact", "routes/contact/index.tsx"),
  route("/auth", "routes/auth/auth.tsx"),
  route("/privacy-policy", "components/privacy-policy.tsx"),

  route("dashboard", "routes/dashboard/index.tsx", [
    index("routes/dashboard/home.tsx"),
    route("links", "routes/dashboard/links.tsx"),
    route("settings", "routes/dashboard/settings.tsx"),
    route("link/:id", "routes/dashboard/link-details.tsx"),
  ]),

  route("upload", "routes/upload/index.tsx"),
  route("/*", "components/not-found.tsx"),
  route("/support", "components/SupportPage.tsx"),
] as RouteConfig;
