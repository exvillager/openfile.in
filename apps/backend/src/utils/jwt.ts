import * as jwt from "jsonwebtoken";

export interface JwtToken {
  id: string | number;
  [key: string]: any;
}

export function verifyToken(token: string): JwtToken {
  if (token.startsWith("Bearer ")) token = token.slice(7);
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as JwtToken;
}

export function verifyRefreshToken(token: string): JwtToken {
  if (token.startsWith("Bearer ")) token = token.slice(7);
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as JwtToken;
}
