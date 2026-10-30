function get_or_throw_env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function get_env(name: string) {
  return process.env[name];
}

export const CONFIG = {
  // SERVER
  PORT: get_env("PORT"),
  NODE_ENV: get_env("NODE_ENV"),
  GOOGLE_CLIENT_ID: get_env("GOOGLE_CLIENT_ID"),
  CORS_ORIGINS: get_or_throw_env("CORS_ORIGIN"),

  // database
  DATABASE_URL: get_or_throw_env("DATABASE_URL"),
  DB_CLIENT: get_env("DB_CLIENT"),
  DB_HOST: get_env("DB_HOST"),
  DB_USER: get_env("DB_USER"),
  DB_PORT: get_env("DB_PORT"),
  DB_NAME: get_env("DB_NAME"),
  DB_PASS: get_env("DB_PASS"),

  // auth
  JWT_SECRET: get_or_throw_env("JWT_SECRET"),
  ACCESS_TOKEN_SECRET: get_or_throw_env("ACCESS_TOKEN_SECRET"),
  ACCESS_TOKEN_EXPIRY: get_env("ACCESS_TOKEN_EXPIRY") ?? "5d",
  REFRESH_TOKEN_SECRET: get_or_throw_env("REFRESH_TOKEN_SECRET"),
  REFRESH_TOKEN_EXPIRY: get_env("REFRESH_TOKEN_EXPIRY") ?? "15d",

  // cloudflare storage
  CLOUDFLARE_BUCKET: get_env("CLOUDFLARE_BUCKET"),
  CLOUDFLARE_ACCOUNT_ID: get_env("CLOUDFLARE_ACCOUNT_ID"),
  CLOUDFLARE_ACCESS_KEY: get_env("CLOUDFLARE_ACCESS_KEY"),
  CLOUDFLARE_SECRET_KEY: get_env("CLOUDFLARE_SECRET_KEY"),
  CLOUDFLARE_TOKEN_VALUE: get_env("CLOUDFLARE_TOKEN_VALUE"),
  STORAGE_TYPE: get_env("STORAGE_TYPE") ?? "r2",

  // mail
  MAIL_SERVICE: get_env("MAIL_SERVICE"),
  MAIL_USER: get_env("MAIL_USER"),
  MAIL_PASS: get_env("MAIL_PASS"),
  RESEND_API_KEY: get_env("RESEND_API_KEY"),

  // redis
  REDIS_HOST: get_env("REDIS_HOST"),
  REDIS_PASS: get_env("REDIS_PASS"),

  // dodo payments
  DODO_PAYMENTS_API_KEY: get_env("DODO_PAYMENTS_API_KEY"),
  DODO_PAYMENTS_WEBHOOK_KEY: get_env("DODO_PAYMENTS_WEBHOOK_KEY"),
  DODO_PAYMENTS_ENVIRONMENT: get_env("DODO_PAYMENTS_ENVIRONMENT") ?? "test_mode",
  DODO_PAYMENTS_RETURN_URL: get_env("DODO_PAYMENTS_RETURN_URL"),
};
