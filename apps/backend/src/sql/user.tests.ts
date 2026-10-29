// import { describe, it, expect, beforeAll, afterAll, test } from 'bun:test'
// import UserSQL from './user'
// import { rawSqlPool } from '../config/db'

// const port = process.env.PORT ?? 8000

// const baseUrl = `http://localhost:${port}`

// const userRepo = new UserSQL()

// let testUser: {
//     id: number,
//     name: string
// }

// beforeAll(async () => {
//     // await rawSqlPool.query(`DELETE FROM "Subscription"`);
//     // await rawSqlPool.query(`DELETE FROM "User"`);
// })

// describe('user raw sql test', () => {
//     // it('', async () => {
//     //     const user = await userRepo.findUserByEmail("fake@gmail.com")
//     //     console.log('user ', user)
//     // })

//     // it("should create a new user", async () => {
//     //     const user = await userRepo.createUser("testuser", "test@example.com");
//     //     testUser.id = user.id;
//     //     expect(user).toHaveProperty("id");
//     //     expect(user.username).toBe("testuser");
//     // });

//     // it("should find user by id", async () => {
//     //     const user = await userRepo.findUserId(testUser.id);
//     //     expect(user.email).toBe("test@example.com");
//     // });

//     // it("should find user by email", async () => {
//     //     const user = await userRepo.findUserByEmail("test@example.com");
//     //     expect(user.username).toBe("testuser");
//     // });
// })
