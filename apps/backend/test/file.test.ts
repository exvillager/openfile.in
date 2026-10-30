import { describe, it, expect, afterAll, beforeAll } from "bun:test";
import { generateAccessToken } from "../src/utils/generate.token";
import { correctUser, fakeUser } from "./auth.test";
import { randomUUIDv7, sleep } from "bun";
import "./server";

interface Link {
  id: number;
  token: string;
  url: string;
}

const port = process.env.PORT ?? 8000;
const baseUrl = `http://localhost:${port}/api/v1`;

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

// Now we will test file controllers here

// describe('**  FIle upload check **', () => {
//     // 1. first we have to create a link and using that link we will have to upload a file.txt on that link
//     it('should create link, get presigned URL, upload to S3, and notify backend', async () => {
//         const createResponse = await fetch(`${baseUrl}/link`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${accessToken}`
//             },
//             body: JSON.stringify({
//                 maxUploads: 1,
//                 token: generateUUID7Token(),
//                 uploadCount: 1,
//                 expiresAt,
//                 userId: correctUser.id,
//             })
//         })
//         const data = await createResponse.json();
//         expect(createResponse.status).toBe(201);

//         const { token } = data;
//         console.log('token ', token)

//         // 2. Get S3 PUT pre-signed URL
//         const file = new File(['Hello, S3 from test'], 'file.txt', { type: 'text/plain' });

//         const uploadUrlResponse = await fetch(`${baseUrl}/file/upload-url?token=${token}`, {
//             method: 'POST',
//             headers: {
//                 ...getAuthHeaders(accessToken),
//             },
//             body: JSON.stringify({
//                 mimeType: file.type,
//                 fileSize: file.size,
//             }),
//         });

//         expect(uploadUrlResponse.status).toBe(200);
//         const { url: s3Url, key: s3Key } = await uploadUrlResponse.json();

//         // 3. now upload file to s3
//         const s3UploadRes = await fetch(s3Url, {
//             method: 'PUT',
//             body: file,
//             headers: {
//                 'Content-Type': file.type,
//             },
//         });
//         expect([200, 204]).toContain(s3UploadRes.status);

//         // 4. Notify backend
//         const notifyRes = await fetch(`${baseUrl}/file/notify-upload?token=${token}`, {
//             method: 'POST',
//             headers: {
//                 ...getAuthHeaders(accessToken),
//             },
//             body: JSON.stringify({
//                 name: 'file.txt',
//                 fileSize: file.size,
//                 s3Key,
//             }),
//         });
//         const notifyData = await notifyRes.json();
//         expect(notifyRes.status).toBe(201);
//         expect(notifyData).toEqual({message: "File metadata stored and link updated."});
//     })
// })

describe("** File upload constraints **", () => {
  it("should not allow more uploads than maxUploads", async () => {
    // here giving max upload 1
    const createResponse = await fetch(`${baseUrl}/link`, {
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
    expect(createResponse.status).toBe(201);
    const { token }: Link = await createResponse.json();

    // First upload URL - should work .
    // upload count increaes to 1
    const uploadRes1 = await fetch(`${baseUrl}/file/upload-url?token=${token}`, {
      method: "POST",
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({
        mimeType: "text/plain",
        fileSize: 18,
      }),
    });
    expect(uploadRes1.status).toBe(200);

    // Upload to S3 : - can be skipped
    //   await fetch(s3Url1, {
    //     method: 'PUT',
    //     headers: { 'Content-Type': 'text/plain' },
    //     body: 'First file upload',
    //   });

    // Notify backend (to increase uploadCount)
    const notify2Res = await fetch(`${baseUrl}/file/notify-upload?token=${token}`, {
      method: "POST",
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({
        name: "first.txt",
        fileSize: 18,
        s3Key: "mock-key-1",
      }),
    });
    expect(notify2Res.status).toBe(201);

    // Second upload URL - should fail. because link has 1 upload count and we are trying again so we will get err 403
    const uploadRes2 = await fetch(`${baseUrl}/file/upload-url?token=${token}`, {
      method: "POST",
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({
        mimeType: "text/plain",
        fileSize: 18,
      }),
    });
    expect(uploadRes2.status).toBe(403);
  });

  it("should not allow upload after expiry time", async () => {
    const shortExpiry = new Date(Date.now() + 2000);

    const createResponse = await fetch(`${baseUrl}/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        maxUploads: 1,
        token: generateUUID7Token(),
        uploadCount: 1,
        expiresAt: shortExpiry,
        userId: correctUser.id,
      }),
    });
    expect(createResponse.status).toBe(201);
    const { token }: Link = await createResponse.json();

    // Sleep for 31 seconds to let the link expire
    console.log("Waiting for link to expire...");
    await sleep(6000);
    console.log("Link expired");

    // Try to get upload URL after expiry
    const expiredUploadRes = await fetch(`${baseUrl}/file/upload-url?token=${token}`, {
      method: "POST",
      headers: getAuthHeaders(accessToken),
      body: JSON.stringify({
        mimeType: "text/plain",
        fileSize: 18,
      }),
    });
    expect([404, 410, 403]).toContain(expiredUploadRes.status);
    const expiredJson = await expiredUploadRes.json();
    expect(expiredJson).toEqual({ error: "Link not found or expired" });
  });
});
