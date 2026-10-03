// openfile stress test: link create -> validate -> presigned upload -> PUT to R2 -> notify -> read paths.
//
// One stage = one fixed number of VUs held for STAGE_DURATION. run.sh calls this once per stage.
//   k6 run -e BASE_URL=... -e VUS=25 -e RUN_ID=... k6-stress.js
import http from 'k6/http'
import { check, sleep, fail } from 'k6'
import { Counter, Rate, Trend } from 'k6/metrics'

const BASE_URL = __ENV.BASE_URL || 'https://api.openfile.exvillager.xyz'
const API = `${BASE_URL}/api/v1`
const VUS = parseInt(__ENV.VUS || '5')
const DURATION = __ENV.STAGE_DURATION || '60s'
const RUN_ID = __ENV.RUN_ID || 'manual'
const FILE_SIZE = parseInt(__ENV.FILE_SIZE || String(50 * 1024))
const THINK_TIME = parseFloat(__ENV.THINK_TIME || '1')
const OUT_DIR = __ENV.OUT_DIR || 'stress-test/results/manual'
// every link made by this test is named with this prefix so cleanup.ts can find it
const LINK_PREFIX = `lt-${RUN_ID}`

// LOADTEST_USERS="user1:pass1,user2:pass2" (accounts must already be on the enterprise plan)
const USERS = (__ENV.LOADTEST_USERS || '').split(',').filter(Boolean).map((p) => p.split(':'))
if (USERS.length === 0) throw new Error('set LOADTEST_USERS="user:pass,user:pass"')

const ENDPOINTS = [
    'create_link', 'validate_link', 'upload_url', 'r2_put', 'notify_upload',
    'list_links', 'list_files', 'signed_url', 'storage_used',
]

// Rate metric per endpoint, so the report can show success % per endpoint
const success = new Rate('success')
// status buckets across every request
const statusCounters = {
    '2xx': new Counter('status_2xx'),
    '401': new Counter('status_401'),
    '403': new Counter('status_403'),
    '404': new Counter('status_404'),
    '429': new Counter('status_429'),
    '4xx_other': new Counter('status_4xx_other'),
    '5xx': new Counter('status_5xx'),
    'network': new Counter('status_network'),
}
// latency of our own API only (excludes the direct PUT to R2)
const backendDuration = new Trend('backend_req_duration', true)
const flowCompleted = new Rate('flow_completed')
const uploadedFiles = new Counter('uploaded_files')

// Expose per-endpoint sub-metrics in the summary (k6 only reports tagged sub-metrics that have a threshold).
const thresholds = {
    flow_completed: ['rate>0.95'],
    http_req_failed: ['rate<0.05'],
}
for (const e of ENDPOINTS) {
    thresholds[`http_req_duration{endpoint:${e}}`] = []
    thresholds[`success{endpoint:${e}}`] = []
    thresholds[`http_reqs{endpoint:${e}}`] = []
}

export const options = {
    scenarios: {
        stage: {
            executor: 'constant-vus',
            vus: VUS,
            duration: DURATION,
            gracefulStop: '30s',
        },
    },
    thresholds,
    summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
    // do not follow the signed-url redirect/etc, keep the raw numbers
    insecureSkipTLSVerify: false,
}

function bucket(status) {
    if (status === 0) return 'network'
    if (status >= 200 && status < 300) return '2xx'
    if (status === 401 || status === 403 || status === 404 || status === 429) return String(status)
    if (status >= 500) return '5xx'
    return '4xx_other'
}

function call(endpoint, method, url, body, headers, expectedStatuses) {
    const params = {
        headers: headers || {},
        tags: { endpoint },
        timeout: '60s',
        responseCallback: http.expectedStatuses(...expectedStatuses),
    }
    const res = method === 'GET' ? http.get(url, params)
        : method === 'PUT' ? http.put(url, body, params)
            : http.post(url, body, params)
    const ok = expectedStatuses.includes(res.status)
    success.add(ok, { endpoint })
    statusCounters[bucket(res.status)].add(1)
    if (endpoint !== 'r2_put') backendDuration.add(res.timings.duration)
    if (!ok && __ENV.LOG_FAILS) {
        console.error(`[${endpoint}] ${res.status} ${String(res.body).slice(0, 150)}`)
    }
    return res
}

export function setup() {
    // log in once per account; every VU then reuses a token (avoids stressing argon2 on prod)
    const tokens = []
    for (const [username, password] of USERS) {
        const res = http.post(`${API}/auth/login`, JSON.stringify({ username, password }), {
            headers: { 'Content-Type': 'application/json' },
            tags: { endpoint: 'login_setup' },
        })
        if (res.status !== 200) fail(`login failed for ${username}: ${res.status} ${res.body}`)
        tokens.push(res.json('accessToken'))
    }
    return { tokens }
}

const fileBody = new Uint8Array(FILE_SIZE).fill(0x61).buffer

export default function (data) {
    const token = data.tokens[(__VU - 1) % data.tokens.length]
    const auth = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
    const json = { 'Content-Type': 'application/json' }
    let completed = false

    // 1. create link
    const create = call('create_link', 'POST', `${API}/link`, JSON.stringify({
        maxUploads: 5,
        name: `${LINK_PREFIX}-vu${__VU}-i${__ITER}`,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    }), auth, [201])

    if (create.status === 201) {
        const linkId = create.json('id')
        const linkToken = create.json('token')

        // 2. validate (public page load)
        call('validate_link', 'GET', `${API}/link/validate?token=${linkToken}`, null, {}, [200])

        // 3. presigned upload url
        const up = call('upload_url', 'POST', `${API}/file/upload-url?token=${linkToken}`,
            JSON.stringify({ mimeType: 'image/png', fileSize: FILE_SIZE }), json, [200])

        if (up.status === 200) {
            const { url, key } = up.json()

            // 4. direct upload to R2 with the presigned url (content-length + content-type are signed)
            const put = call('r2_put', 'PUT', url, fileBody, { 'Content-Type': 'image/png' }, [200])

            if (put.status === 200) {
                // 5. confirm
                const notify = call('notify_upload', 'POST', `${API}/file/notify-upload?token=${linkToken}`,
                    JSON.stringify({ s3Key: key, fileSize: FILE_SIZE, name: 'loadtest.png' }), json, [201])

                if (notify.status === 201) {
                    uploadedFiles.add(1)

                    // 6. dashboard reads
                    call('list_links', 'GET', `${API}/link?limit=10&page=1`, null, auth, [200])
                    const files = call('list_files', 'GET', `${API}/file/${linkId}/${linkToken}/files?limit=10&page=1`, null, auth, [200])
                    const fileId = files.status === 200 ? (files.json('data.0.id')) : null
                    if (fileId) {
                        call('signed_url', 'GET', `${API}/file/signed-url?token=${linkToken}&fileId=${fileId}`, null, auth, [200])
                    }
                    call('storage_used', 'GET', `${API}/file/storage-used`, null, auth, [200])
                    completed = true
                }
            }
        }
    }

    flowCompleted.add(completed)
    sleep(THINK_TIME)
}

export function handleSummary(data) {
    return {
        [`${OUT_DIR}/summary.json`]: JSON.stringify({ vus: VUS, duration: DURATION, runId: RUN_ID, fileSize: FILE_SIZE, metrics: data.metrics, state: data.state }, null, 2),
        stdout: '', // run.sh prints its own stage line; keep k6 output quiet at the end
    }
}
