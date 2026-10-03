// Upgrades the given users to the enterprise plan (unlimited links) so the stress
// test is not capped by the free plan's 5 links/day. Reads DATABASE_URL from ../.env.
//
//   bun stress-test/set-enterprise.ts user1 user2 ...
import { Pool } from 'pg'

const usernames = process.argv.slice(2)
if (usernames.length === 0) {
    console.error('usage: bun stress-test/set-enterprise.ts <username> [<username> ...]')
    process.exit(1)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

try {
    for (const username of usernames) {
        const { rows } = await pool.query('SELECT id FROM "User" WHERE username = $1', [username])
        if (rows.length === 0) {
            console.log(`- ${username}: NOT FOUND (skipped)`)
            continue
        }
        const userId = rows[0].id

        const updated = await pool.query(
            `UPDATE "Subscription" SET "planName" = 'enterprise', status = 'ACTIVE', "updatedAt" = now() WHERE "userId" = $1`,
            [userId],
        )
        if (updated.rowCount === 0) {
            await pool.query(
                `INSERT INTO "Subscription" (id, "userId", "planName", status) VALUES (gen_random_uuid(), $1, 'enterprise', 'ACTIVE')`,
                [userId],
            )
        }
        // start from a clean daily counter
        await pool.query('UPDATE "User" SET "linkCount" = 0, "linkCountExpireAt" = NULL WHERE id = $1', [userId])
        console.log(`- ${username}: enterprise (${userId})`)
    }
} finally {
    await pool.end()
}
