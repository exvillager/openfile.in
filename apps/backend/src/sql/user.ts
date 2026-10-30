{
  /*

    Here we will write only RAW SQL instaed of prisma .
    it will help me to learn it and understand it.
    
*/
}

import { IUserRepository } from "../interface/user.interface";
// import { rawSqlPool } from "../config/db";

export class UserSQL implements IUserRepository {
  pool: any;
  constructor() {
    // this.pool = rawSqlPool
  }

  //
  async findUserId(id: number) {
    const query = ` SELECT * FROM "User" where "id" = $1 `;
    const values = [id];
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async findUserByEmail(email: string) {
    const query = ` SELECT * FROM "User" where "email" = $1 `;
    const values = [email];
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async findUserAndPlanName(userId: number) {
    const query = `
         SELECT u.id,u.name,u.email,u.avatar, s.PlanName FROM users AS u
         LEFT JOIN subscription AS s ON u.id = s.userId
         WHERE u.id=$1
         `;
    const values = [userId];
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async createUser(username: string, email: string) {
    const query = `INSERT INTO "User" (username, email) VALUES ($1,$2) RETURNING *`;
    const values = [username, email];
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async updateUser(id: number, username: string) {
    const query = `
        UPDATE "User" 
        SET "username" = $1
        WHERE "id"=$2
        `;
    const values = [username, id];
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  //
  async deleteUser(id: number) {
    const query = `DELETE FROM "User" WHERE "id" = $1`;
    const values = [id];
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async updateUserPlan(email: string) {
    const query = `
        UPDATE "User" 
        SET subscription.planName = $1
        where "email" = $2
        `;
    const values = ["pro", email];
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }
}

export default UserSQL;
