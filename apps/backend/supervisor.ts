// Spawns and babysits the server worker processes: restarts one that dies, forwards stop signals.

// A `bun build --compile` binary re-runs itself; under `bun index.ts` we re-run bun with the script.
const compiled = Bun.main.startsWith("/$bunfs");
const command = compiled ? [process.execPath] : [process.execPath, Bun.main];

export function runSupervisor(count: number) {
  const children = new Map<number, ReturnType<typeof Bun.spawn>>();
  let stopping = false;

  const start = (id: number) => {
    const child = Bun.spawn(command, {
      env: { ...process.env, OPENFILE_WORKER: String(id) },
      stdout: "inherit",
      stderr: "inherit",
      onExit(_proc, code, signal) {
        children.delete(id);
        if (stopping) {
          if (children.size === 0) process.exit(0);
          return;
        }
        console.error(
          `[Supervisor] worker ${id} exited (code=${code}, signal=${signal}); restarting in 1s`,
        );
        setTimeout(() => !stopping && start(id), 1000);
      },
    });
    children.set(id, child);
  };

  const stop = (signal: NodeJS.Signals) => {
    if (stopping) return;
    stopping = true;
    for (const child of children.values()) child.kill(signal);
    if (children.size === 0) process.exit(0);
    // do not hang forever if a worker ignores the signal
    setTimeout(() => process.exit(1), 15_000).unref();
  };
  process.on("SIGTERM", () => stop("SIGTERM"));
  process.on("SIGINT", () => stop("SIGINT"));

  console.log(`[Supervisor] starting ${count} workers`);
  for (let i = 0; i < count; i++) start(i);
}
