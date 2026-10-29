import { describe, it, expect, afterAll } from "bun:test";
import { generateAccessToken } from "../src/utils/generate.token";
import { correctUser, fakeUser } from "./auth.test";
import { randomUUIDv7 } from "bun";
import "./server";

interface Link {
  id: number;
  token: string;
  url: string;
}

const port = process.env.PORT ?? 8000;
const baseUrl = `http://localhost:${port}`;

const accessToken = generateAccessToken(correctUser);
const now = new Date();
const expiresAt = new Date(now.getTime() + 1 * 60 * 60 * 1000);

function generateUUID7Token() {
  return randomUUIDv7("base64url");
}

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

describe("GET /api/v1/link", () => {
  it("should return 401 when no token is provided", async () => {
    const response = await fetch(`${baseUrl}/api/v1/link`);
    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data).toEqual({
      message: "Unauthorized",
      error: "No token provided",
    });
  });

  it("should return 201 and create a link", async () => {
    const accessToken = generateAccessToken(correctUser);
    const token = generateUUID7Token();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const response = await fetch(`${baseUrl}/api/v1/link`, {
      method: "POST",
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({
        maxUploads: 1,
        token,
        uploadCount: 1,
        expiresAt,
        userId: correctUser.id,
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(201);
  });

  it("should return 400 for invalid values", async () => {
    const accessToken = generateAccessToken(correctUser);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const response = await fetch(`${baseUrl}/api/v1/link`, {
      method: "POST",
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({
        maxUploads: 0,
        token: "",
        uploadCount: 0,
        expiresAt,
        userId: correctUser.id,
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Number must be greater than or equal to 1" });
  });

  it("should return 401 for malformed token", async () => {
    const response = await fetch(`${baseUrl}/api/v1/link`, {
      method: "POST",
      headers: getAuthHeaders("Bearer broken.token.here"),
      body: JSON.stringify({
        maxUploads: 1,
        token: generateUUID7Token(),
        uploadCount: 1,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        userId: correctUser.id,
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(401);
    expect(data).toEqual({
      message: "Unauthorized",
      error: "Malformed or tampered token",
    });
  });

  it("should return 400 for missing required fields", async () => {
    const accessToken = generateAccessToken(correctUser);

    const response = await fetch(`${baseUrl}/api/v1/link`, {
      method: "POST",
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({
        // missing required fields here
        token: generateUUID7Token(),
      }),
    });

    const data = await response.json();
    expect(response.status).toBe(400);
    expect(data).toHaveProperty("error");
  });
});

describe("DELETE /api/v1/link/:id", () => {
  it("should delete the link successfully and return 200", async () => {
    const linkResponse = await fetch(`${baseUrl}/api/v1/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        maxUploads: 1,
        token: generateUUID7Token(),
        uploadCount: 1,
        expiresAt,
        userId: correctUser.id,
      }),
    });

    const { id }: Link = await linkResponse.json();

    expect(linkResponse.status).toBe(201);

    // should reject for giving wrong user accessToken
    const wrongUserToken = generateAccessToken(fakeUser);
    const wrongResponse = await fetch(`${baseUrl}/api/v1/link/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${wrongUserToken}`,
      },
    });
    const wrongData = await wrongResponse.json();
    expect(wrongResponse.status).toBe(404);
    expect(wrongData).toEqual({ message: "Not Found" });

    // should delete the link for giving correct user accessToken
    const delResponse = await fetch(`${baseUrl}/api/v1/link/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect(delResponse.status).toBe(200);
    const data = await delResponse.json();
    expect(data).toBe("link deleted successfully");
  });
});

describe("** GET /api/v1/link/ **", () => {
  it("should return all links of the user or 404 if none", async () => {
    const accessToken = generateAccessToken(correctUser);
    const response = await fetch(`${baseUrl}/api/v1/link/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect([200, 404]).toContain(response.status);

    if (response.status === 404) {
      const data = await response.text();
      expect(data).toBe("404 Not Found");
    }

    // now it will show links when we first create then get
    const linkResponse = await fetch(`${baseUrl}/api/v1/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        maxUploads: 1,
        token: generateUUID7Token(),
        uploadCount: 1,
        expiresAt,
        userId: correctUser.id,
      }),
    });

    expect(linkResponse.status).toBe(201);

    const getresponse = await fetch(`${baseUrl}/api/v1/link/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    expect([200, 404]).toContain(getresponse.status);
    if (getresponse.status === 200) {
      const data = await getresponse.json();
      expect(Array.isArray(data)).toBe(true);
    }
  });
});

describe("Validate Token check", () => {
  it("should return 404 when token is not provided", async () => {
    const response = await fetch(`${baseUrl}/api/v1/link/validate?token`);
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: "pls provide token" });
  });

  it("should return 400 when token is invalid", async () => {
    const response = await fetch(`${baseUrl}/api/v1/link/validate?token=${generateUUID7Token()}`);
    expect(response.status).toBe(400);
  });

  // now fecth some link and then validate that res link

  it("should return 200 when token is valid", async () => {
    // Create a new link
    const createResponse = await fetch(`${baseUrl}/api/v1/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        maxUploads: 1,
        token: generateUUID7Token(),
        uploadCount: 1,
        expiresAt,
        userId: correctUser.id,
      }),
    });

    const data = await createResponse.json();
    expect(createResponse.status).toBe(201);

    // Validate the token
    const { token } = data;
    const validateRes = await fetch(`${baseUrl}/api/v1/link/validate?token=${token}`);
    const validateData = await validateRes.json();

    expect(validateRes.status).toBe(200);
    expect(validateData).toEqual({ message: "Link is valid" });
  });
});
