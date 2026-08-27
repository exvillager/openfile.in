import { Pool } from 'pg'
import { serve } from 'diesel-core/node'
import { CONFIG } from '@/config'  // throws at import time if required env vars are missing
import { createApp } from './app'

async function checkDB() {
    const pool = new Pool({ connectionString: CONFIG.DATABASE_URL })
    try {
        await pool.query('SELECT 1')
        console.log('[DB] Connection OK')
    } finally {
        await pool.end()
    }
}

export async function startServer() {
    await checkDB()

    const app = createApp()
    const port = CONFIG.PORT || 8000

    serve({
        port,
        fetch: app.fetch as any,
    })

    console.log(`Listening on http://localhost:${port}`)
}
