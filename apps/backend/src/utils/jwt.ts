import * as jwt from "jsonwebtoken";

export interface JwtToken {
  id: string | number;
  [key: string]: any;
}

// Pin the accepted algorithm. Without this, jsonwebtoken accepts any algorithm
// the token header claims, opening the door to algorithm-confusion attacks.
// Tokens are signed with HS256 (see generate.token.ts), so verify only HS256.
export function verifyToken(token: string): JwtToken {
  if (token.startsWith("Bearer ")) token = token.slice(7);
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, {
    algorithms: ["HS256"],
  }) as JwtToken;
}

export function verifyRefreshToken(token: string): JwtToken {
  if (token.startsWith("Bearer ")) token = token.slice(7);
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!, {
    algorithms: ["HS256"],
  }) as JwtToken;
}
