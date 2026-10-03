// Deletes every link (and its files, via the backend's delete queue) created by the stress test.
// Test links are named lt-<runId>-vu<N>-i<N>.
//
//   bun stress-test/cleanup.ts            # all stress-test links (prefix "lt-")
//   bun stress-test/cleanup.ts <runId>    # only one run
const BASE = process.env.BASE_URL ?? 'https://api.openfile.exvillager.xyz'
const API = `${BASE}/api/v1`
const runId = process.argv[2]
const prefix = runId ? `lt-${runId}` : 'lt-'
const CONCURRENCY = 8

// LOADTEST_USERS="user1:pass1,user2:pass2", same value as for the k6 run
const USERS = (process.env.LOADTEST_USERS ?? '').split(',').filter(Boolean).map((p) => p.split(':') as [string, string])
if (USERS.length === 0) { console.error('set LOADTEST_USERS="user:pass,user:pass"'); process.exit(1) }

async function login(username: string, password: string) {
    const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    })
    if (!res.ok) throw new Error(`login ${username}: ${res.status}`)
    return ((await res.json()) as any).accessToken as string
}

let total = 0
let failed = 0

for (const [username, password] of USERS) {
    const token = await login(username, password)
    const headers = { Authorization: `Bearer ${token}` }
    let deleted = 0
    let page = 1

    while (true) {
        const res = await fetch(`${API}/link?query=${encodeURIComponent(prefix)}&limit=50&page=${page}`, { headers })
        if (!res.ok) { console.error(`${username}: list failed ${res.status}`); break }
        const data: any[] = ((await res.json()) as any).data ?? []
        if (data.length === 0) break

        const mine = data.filter((l) => String(l.name).startsWith(prefix))
        const queue = [...mine]
        await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
            while (queue.length) {
                const link = queue.pop()!
                const r = await fetch(`${API}/link/${link.id}`, { method: 'DELETE', headers })
                if (r.ok) deleted++
                else { failed++; console.error(`${username}: delete ${link.id} -> ${r.status}`) }
            }
        }))
        // links we kept (name did not match) stay at the front, so move on a page
        if (mine.length < data.length) page++
        if (mine.length === 0 && data.length < 50) break
    }
    console.log(`${username}: deleted ${deleted} links`)
    total += deleted
}
console.log(`done: ${total} links deleted, ${failed} failures. File deletion continues in the backend worker.`)
