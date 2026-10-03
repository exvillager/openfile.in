// Builds per-stage reports (stage-N/report.md) and an overall REPORT.md from k6 summary.json files.
//   bun stress-test/report.ts stress-test/results/<run>
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const dir = process.argv[2]
if (!dir) { console.error('usage: bun stress-test/report.ts <results-dir>'); process.exit(1) }

const ENDPOINTS: [string, string][] = [
    ['create_link', 'POST /link'],
    ['validate_link', 'GET /link/validate'],
    ['upload_url', 'POST /file/upload-url'],
    ['r2_put', 'PUT <presigned R2 url>'],
    ['notify_upload', 'POST /file/notify-upload'],
    ['list_links', 'GET /link'],
    ['list_files', 'GET /file/:id/:token/files'],
    ['signed_url', 'GET /file/signed-url'],
    ['storage_used', 'GET /file/storage-used'],
]

const stages = readdirSync(dir)
    .filter((d) => d.startsWith('stage-') && existsSync(join(dir, d, 'summary.json')))
    .map((d) => ({ name: d, ...JSON.parse(readFileSync(join(dir, d, 'summary.json'), 'utf8')) }))
    .sort((a, b) => a.vus - b.vus)

const v = (s: any, m: string) => s.metrics[m]?.values ?? {}
const ms = (n?: number) => (n === undefined ? '-' : n >= 1000 ? `${(n / 1000).toFixed(2)}s` : `${n.toFixed(0)}ms`)
const pct = (n?: number) => (n === undefined ? '-' : `${(n * 100).toFixed(2)}%`)
const num = (n?: number) => (n === undefined ? '-' : Math.round(n).toLocaleString('en-US'))
const mb = (n?: number) => (n === undefined ? '-' : `${(n / 1024 / 1024).toFixed(1)} MB`)

function stageSummary(s: any) {
    const reqs = v(s, 'http_reqs')
    const dur = v(s, 'backend_req_duration')
    const secs = (s.state?.testRunDurationMs ?? 0) / 1000
    const failRate = v(s, 'http_req_failed').rate ?? 0
    const flow = v(s, 'flow_completed').rate ?? 0
    return {
        vus: s.vus, secs, reqs: reqs.count, rps: reqs.rate, failRate, flow,
        iters: v(s, 'iterations').count, files: v(s, 'uploaded_files').count ?? 0,
        avg: dur.avg, med: dur.med, p90: dur['p(90)'], p95: dur['p(95)'], p99: dur['p(99)'], max: dur.max,
        sent: v(s, 'data_sent').count, recv: v(s, 'data_received').count,
        verdict: failRate < 0.01 && flow > 0.99 ? 'PASS' : failRate < 0.05 && flow > 0.95 ? 'DEGRADED' : 'FAIL',
    }
}

function endpointTable(s: any) {
    const rows = ENDPOINTS.map(([key, label]) => {
        const d = s.metrics[`http_req_duration{endpoint:${key}}`]?.values
        const r = s.metrics[`http_reqs{endpoint:${key}}`]?.values
        const ok = s.metrics[`success{endpoint:${key}}`]?.values
        if (!d) return `| ${label} | 0 | - | - | - | - | - | - | - |`
        return `| ${label} | ${num(r?.count)} | ${pct(ok?.rate)} | ${ms(d.avg)} | ${ms(d.med)} | ${ms(d['p(90)'])} | ${ms(d['p(95)'])} | ${ms(d['p(99)'])} | ${ms(d.max)} |`
    })
    return ['| Endpoint | Requests | Success | avg | p50 | p90 | p95 | p99 | max |', '|---|--:|--:|--:|--:|--:|--:|--:|--:|', ...rows].join('\n')
}

function statusTable(s: any) {
    const keys: [string, string][] = [['2xx', '2xx OK'], ['401', '401'], ['403', '403'], ['404', '404'], ['429', '429 rate-limited'], ['4xx_other', 'other 4xx'], ['5xx', '5xx server error'], ['network', 'network error / timeout']]
    return ['| Status | Count |', '|---|--:|', ...keys.map(([k, l]) => `| ${l} | ${num(s.metrics[`status_${k}`]?.values?.count ?? 0)} |`)].join('\n')
}

const overall: string[] = []
for (const s of stages) {
    const x = stageSummary(s)
    const body = `# Stage: ${x.vus} concurrent users

Run \`${s.runId}\` · ${s.duration} hold · file size ${(s.fileSize / 1024).toFixed(0)} KB · verdict **${x.verdict}**

## Headline
| Metric | Value |
|---|--:|
| Concurrent users (VUs) | ${x.vus} |
| Test duration | ${x.secs.toFixed(0)}s |
| Total requests | ${num(x.reqs)} |
| Throughput | ${x.rps?.toFixed(1)} req/s |
| Full flows started | ${num(x.iters)} |
| Full flow completed (link -> upload -> notify -> reads) | ${pct(x.flow)} |
| Files uploaded and confirmed | ${num(x.files)} |
| HTTP error rate | ${pct(x.failRate)} |
| Backend API latency avg / p50 / p90 (excl. R2 PUT) | ${ms(x.avg)} / ${ms(x.med)} / ${ms(x.p90)} |
| Backend API latency p95 / p99 / max | ${ms(x.p95)} / ${ms(x.p99)} / ${ms(x.max)} |
| Data sent / received | ${mb(x.sent)} / ${mb(x.recv)} |

## Per endpoint
${endpointTable(s)}

## Status codes
${statusTable(s)}
`
    writeFileSync(join(dir, s.name, 'report.md'), body)
    overall.push(`| ${x.vus} | ${num(x.reqs)} | ${x.rps?.toFixed(1)} | ${pct(x.failRate)} | ${pct(x.flow)} | ${num(x.files)} | ${ms(x.med)} | ${ms(x.p95)} | ${ms(x.p99)} | ${ms(x.max)} | ${x.verdict} |`)
}

// per-endpoint p95 across stages: shows which step degrades first
const p95Header = `| Endpoint | ${stages.map((s) => `${s.vus} VUs`).join(' | ')} |`
const p95Rows = ENDPOINTS.map(([key, label]) =>
    `| ${label} | ${stages.map((s) => ms(s.metrics[`http_req_duration{endpoint:${key}}`]?.values?.['p(95)'])).join(' | ')} |`)

const firstBad = stages.find((s) => stageSummary(s).verdict !== 'PASS')
const report = `# openfile stress test report

Run \`${stages[0]?.runId}\` · target and flow: create link -> validate -> presigned URL -> PUT to R2 -> notify -> dashboard reads

Verdict rules: **PASS** = HTTP errors < 1% and >99% of flows completed · **DEGRADED** = < 5% errors and > 95% flows · **FAIL** = otherwise.

## Summary by user count
| VUs | Requests | req/s | Errors | Flows OK | Files | API p50 | API p95 | API p99 | API max | Verdict |
|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|---|
${overall.join('\n')}

${firstBad ? `First stage that was not a clean PASS: **${firstBad.vus} VUs**.` : 'Every stage passed cleanly.'}

## p95 latency per endpoint, by user count
${p95Header}
|---|${stages.map(() => '--:').join('|')}|
${p95Rows.join('\n')}

Per-stage details: ${stages.map((s) => `\`${s.name}/report.md\``).join(', ')}

> Numbers include network latency from the machine running k6. Only 6 accounts are used, so VUs share accounts.
`
writeFileSync(join(dir, 'REPORT.md'), report)
console.log(report)
