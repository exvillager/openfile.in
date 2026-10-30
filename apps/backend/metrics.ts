import { Registry, Gauge, Counter, Histogram } from "prom-client";
import * as os from "os";

// Create registry
const registry = new Registry();
// with several worker processes each one only reports its own numbers
registry.setDefaultLabels({ worker: process.env.OPENFILE_WORKER ?? "solo" });

// ===== Gauges ===== //

// CPU load (1-min average)
const cpuGauge = new Gauge({
  name: "cpu_load_avg_1m",
  help: "1-minute load average",
});
registry.registerMetric(cpuGauge);

// Memory usage
const rssGauge = new Gauge({ name: "memory_rss_mb", help: "RSS memory in MB" });
const heapTotalGauge = new Gauge({ name: "memory_heap_total_mb", help: "Heap total in MB" });
const heapUsedGauge = new Gauge({ name: "memory_heap_used_mb", help: "Heap used in MB" });

registry.registerMetric(rssGauge);
registry.registerMetric(heapTotalGauge);
registry.registerMetric(heapUsedGauge);

// Event loop lag
const eventLoopLagGauge = new Gauge({
  name: "event_loop_lag_ms",
  help: "Approximate event loop lag in milliseconds",
});
registry.registerMetric(eventLoopLagGauge);

// ===== Counters ===== //
const httpRequestsCounter = new Counter({
  name: "http_requests_total",
  help: "Total HTTP requests",
  labelNames: ["method", "path", "status"],
});
registry.registerMetric(httpRequestsCounter);

// ===== Histograms ===== //
const httpResponseTime = new Histogram({
  name: "http_response_time_seconds",
  help: "HTTP response time in seconds",
  labelNames: ["method", "path", "status"],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
registry.registerMetric(httpResponseTime);

// ===== Update system metrics every ===== //

const computeMetrics = (time = 30 * 1000) => {
  const update = () => {
    const mem = process.memoryUsage();
    const cpuLoad = os.loadavg()[0];

    cpuGauge.set(cpuLoad);
    rssGauge.set(mem.rss / 1024 / 1024);
    heapTotalGauge.set(mem.heapTotal / 1024 / 1024);
    heapUsedGauge.set(mem.heapUsed / 1024 / 1024);

    const start = Date.now();
    setTimeout(() => eventLoopLagGauge.set(Date.now() - start), 0);

    console.log(
      `[Metrics] CPU:${cpuLoad.toFixed(2)} RSS:${(mem.rss / 1024 / 1024).toFixed(2)}MB HeapUsed:${(mem.heapUsed / 1024 / 1024).toFixed(2)}MB`,
    );
  };

  update();
  setInterval(update, time);
};

computeMetrics();

export { registry, httpRequestsCounter, httpResponseTime };
