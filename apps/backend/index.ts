// Entry point. Starts WORKERS copies of the server (default 2, hard cap 2) so both cores are used.
// Each copy is a separate process listening on the same port via SO_REUSEPORT (see serve.ts).
// WORKERS=1 runs a single process with no supervisor (local dev, tests).
const MAX_WORKERS = 2;
const requested = parseInt(process.env.WORKERS ?? "", 10);
const workers = Math.min(
  MAX_WORKERS,
  Math.max(1, Number.isNaN(requested) ? MAX_WORKERS : requested),
);

if (workers > 1 && process.env.OPENFILE_WORKER === undefined) {
  // supervisor: does not load the app, so no DB/Redis connections or background jobs here
  const { runSupervisor } = await import("./supervisor");
  runSupervisor(workers);
} else {
  await import("./worker");
}
