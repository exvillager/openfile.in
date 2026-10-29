import { OAuth2Client } from "google-auth-library";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID ?? "google client id";

export const oAuthClient = new OAuth2Client(GOOGLE_CLIENT_ID);
