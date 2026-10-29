import * as jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import { User } from "../interface/user.interface";

export const generateAccessAndRefreshToken = async (
  user: User,
): Promise<{ accessToken: string; refreshToken: string }> => {
  try {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("error while generating refresh and access token", error);
    throw {
      status: 500,
      message: "Something went wrong while generating refresh and access token",
    };
  }
};

export const generateAccessToken = (user: User): string => {
  const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
  const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;

  if (!ACCESS_TOKEN_SECRET || !ACCESS_TOKEN_EXPIRY) {
    throw new Error("Access token environment variables are not defined.");
  }

  return jwt.sign({ id: user?.id, username: user?.username }, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY as StringValue,
  });
};

const generateRefreshToken = (user: User): string => {
  const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
  const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;

  if (!REFRESH_TOKEN_SECRET || !REFRESH_TOKEN_EXPIRY) {
    throw new Error("Refresh token environment variables are not defined.");
  }

  return jwt.sign(
    {
      id: user?.id,
      username: user?.username,
    },
    REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY as StringValue,
    },
  );
};
