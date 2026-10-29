import { Pool } from "pg";

const pool = new Pool({
  user: "pradeep",
  host: "localhost",
  database: "openfile",
  password: "pradeep",
  port: 5432,
});

class LinkSQL {
  constructor() {}

  //
  async findLinkByIdAndUser(linkId: number, userId: number) {
    const query = `
        SELECT l.id,l.token,f.url,f.id FROM link as l 
        WHERE id = $1 AND userId = $2
        LEFT JOIN files as f ON l.userId=f.userId `;

    const values = [linkId, userId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async findLinkByTokenAndUserId(token: string, userId: number) {
    const query = `
        SELECT * FROM link WHERE token=$1 AND userId=$2 `;

    const values = [token, userId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async findLinkByToken(token: string) {
    const query = `
        SELECT * FROM link WHERE token=$1`;

    const values = [token];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async deleteLink(linkId: number, userId: number) {
    const query = `
        DELETE FROM link WHERE userId=$1 AND LinkId=$2 `;

    const values = [userId, linkId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async findLinkWithFilesByTokenAndUserId(
    linkId: number,
    token: string,
    userId: number,
    skip: number,
    limit: number,
  ) {
    // we have to fina a link and files related to it with limit
    let query = `
        SELECT 
        l.id , 
        f.id, 
        f.name, 
        f.url, 
        f.size, 
        f.createdAt 
        FROM link AS l
        
        LEFT JOIN files AS f 
            ON l.id = f.uploadLinkId
        
        WHERE l.id=$1 
            AND l.userId = $2
            AND l.token = $3

        OFFSET $4
        LIMIT $5
        `;

    // this is diff quer , it will create nested fiels under files{}
    query = `
        SELECT 
  l.id,
  COALESCE(
    json_agg(
      json_build_object(
        'id', f.id,
        'name', f.name,
        'url', f.url,
        'size', f.size,
        'createdAt', f."createdAt"
      )
    ) FILTER (WHERE f.id IS NOT NULL),
    '[]'
  ) AS files
FROM link AS l
LEFT JOIN files AS f 
  ON l.id = f.uploadLinkId
WHERE l.id = $1 
  AND l.userId = $2
  AND l.token = $3
GROUP BY l.id
OFFSET $4 
LIMIT $5;

`;

    const values = [linkId, userId];
    const result = await pool.query(query, values);
    return result.rows;
  }

  //
  async findUserLinks(userId: number, query: string, skip: number, limit: number) {
    const raw_query = `
        SELECT 
        l.id,
        l.name,
        l.token,
        l.maxUploads,
        l.createdAt,
        l.uploadCount,
        l.expiresAt
        FROM links as l
        WHERE l.userId=$1
            OR ( l.name ILIKE CONCAT('%', $2, '%') OR l.token ILIKE CONCAT('%', $2, '%'))
        ORDER BY l.createdAt DESC
        OFFSET $3
        LIMIT $4
        `;

    const values = [userId, query, skip, limit];
    const result = await pool.query(query, values);
    return result.rows;
  }

  //
  async findLinkUploadCount(linkId: number) {
    const query = `
        SELECT uploadCount FROM links where id=$1
        `;
    const values = [linkId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async FindUserLinksCount(userId: number) {
    const query = `
        SELECT COUNT(*)::INT as count FROM links where userId = $1
        `;
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }
}

export default LinkSQL;
