import { describe, it, expect, beforeAll, afterAll } from "bun:test";
import { generateAccessToken } from "../src/utils/generate.token";
import "./server";

export const correctUser = {
  id: 1,
  email: "pradeepkumarbgs62019@gmail.com",
  name: "pradeep kumar",
  avatar:
    "https://lh3.googleusercontent.com/a/ACg8ocKmvBc70nqiQ_jmbU1Xzj8GndXxH-CgAmDmUv4EEubUcQJEdfSg=s96-c",
  linkCount: 11,
  linkCountExpireAt: "2025-07 - 18T10: 16: 47.153Z",
  createdAt: "2025-07 - 11T09: 17: 33.779Z",
  updatedAt: "2025-07 - 18T08: 54: 22.354Z",
};

export const fakeUser = {
  id: 20,
  email: "pradeepkumarbgs62019@gmail.com",
  name: "pradeep kumar",
  avatar: "",
  linkCount: 11,
  linkCountExpireAt: "2025-07 - 18T10: 16: 47.153Z",
  createdAt: "2025-07 - 11T09: 17: 33.779Z",
  updatedAt: "2025-07 - 18T08: 54: 22.354Z",
};

const port = process.env.PORT ?? 8000;

const baseUrl = `http://localhost:${port}`;

describe("GET /api/v1/auth/check", () => {
  // not providing accessToken
  it("should return 401", async () => {
    const response = await fetch(`${baseUrl}/api/v1/auth/check`);
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized" });
  });

  it("should return 401 for giving wrong user id", async () => {
    const accessToken = generateAccessToken(fakeUser);

    const response = await fetch(`${baseUrl}/api/v1/auth/check`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data).toEqual({ error: "Unauthorized: User not found" });
  });

  it("should return 200 for correct user id 1", async () => {
    const accessToken = generateAccessToken(correctUser);

    const response = await fetch(`${baseUrl}/api/v1/auth/check`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    expect(response.status).toBe(200);
  });
});
