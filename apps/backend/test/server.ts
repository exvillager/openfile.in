import app from "../app";

const port = process.env.PORT;

if (!port) {
  throw new Error("PORT environment variable is not set.");
}

Bun.serve({
  port,
  fetch: app.fetch,
});
console.log(`is server started ? -> ${port}`);
