import { Pool } from "pg";

const pool = new Pool({
  user: "pradeep",
  host: "localhost",
  database: "openfile",
  password: "pradeep",
  port: 5432,
});

class FileSQL {
  constructor() {}

  //
  async getUser(id: number) {
    const query = `
        SELECT id from users WHERE id=$1
        `;
    const values = [id];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async findFileByIdUserIdAndLinkId(fileId: number, userId: number, linkId: number) {
    const query = `
        SELECT * from files 
            WHERE id=$1 
            AND userId=$2 
            AND uploadLinkId=$3
        `;
    const values = [fileId, userId, linkId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async storageUsed(userId: number) {
    const query = `
        SELECT COALESCE(SUM(size), 0)::bigint AS totalSize 
        FROM files 
        WHERE userId = $1
        `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async createFileAndUpdateLink({ url, name, size }, linkId: number, userId: number) {
    try {
      await pool.query("BEGIN");

      const insertFile = `
          INSERT INTO files (url, name, size, "userId", "uploadLinkId")
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
      const fileResult = await pool.query(insertFile, [url, name, size, userId, linkId]);

      const updateLink = `
          UPDATE links
          SET "uploadCount" = "uploadCount" + 1
          WHERE id = $1
          RETURNING *
        `;
      await pool.query(updateLink, [linkId]);

      await pool.query("COMMIT");

      return fileResult.rows[0];
    } catch (error) {
      await pool.query("ROLLBACK");
      throw error;
    } finally {
      // pool.release()
    }
  }

  // get user files with limit
  async getFiles(linkId: number, userId: number, skip: number, limit: number) {
    const query = `
            SELECT * FROM files
            WHERE userId=$1 AND uploadLinkId=$2
            ORDER BY createdAt DESC
            OFFSET $3
            LIMIT $5
        `;
    const values = [userId, linkId, skip, limit];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
}
