import { Context, CookieOptions } from "diesel-core";

export const accessTokenOptions: CookieOptions = {
  httpOnly: true,
  path: "/",
  secure: true,
  sameSite: "None",
  maxAge: 5 * 24 * 60 * 60,
};

export const refreshTokenOptions: CookieOptions = {
  ...accessTokenOptions,
  maxAge: 15 * 24 * 60 * 60,
};

type Options = {
  c: Context;
  accessToken: string;
  refreshToken: string;
};
export const set_cookie = (params: Options): void => {
  params.c.setCookie("accessToken", params.accessToken, accessTokenOptions);
  params.c.setCookie("refreshToken", params.refreshToken, refreshTokenOptions);
};
