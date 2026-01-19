import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env file

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(8000),
    DATABASE_URL: z.string().min(1, "Database URL is required"),
    ELASTICSEARCH_NODE: z.string().url(),
    JWT_SECRET: z.string().min(32, "JWT secret must be at least 32 characters"),
    JWT_REFRESH_SECRET: z.string().min(32, "JWT refresh secret must be at least 32 characters"),
    ACCESS_TOKEN_EXPIRES: z.string().default("15m"),
    REFRESH_TOKEN_EXPIRES: z.string().default("7d"),
    EMAIL_USER:z.string(),
    EMAIL_PASS:z.string(),
  },

  clientPrefix: "PUBLIC_",
  client: {},

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
    ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES,
    REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES,
    EMAIL_PASS:process.env.EMAIL_PASS,
    EMAIL_USER:process.env.EMAIL_USER,

  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",

  database: {
    url: env.DATABASE_URL,
  },

  elasticsearch: {
    node: env.ELASTICSEARCH_NODE,
  },

  auth: {
    jwtSecretKey: env.JWT_SECRET,
    jwtRefreshSecretKey: env.JWT_REFRESH_SECRET,
    accessTokenExpires: env.ACCESS_TOKEN_EXPIRES,
    refreshTokenExpires: env.REFRESH_TOKEN_EXPIRES,
  },
  email:{
    emailId:env.EMAIL_USER,
    pass:env.EMAIL_PASS
  }
} as const;

if (config.isDevelopment) {
  console.log("\n🔧 Configuration:");
  console.log(`   Port: ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Database: ${config.database.url ? "✅" : "❌"}`);
  console.log(`   Elasticsearch: ${config.elasticsearch.node ? "✅" : "❌"}`);
  console.log(`   JWT Secret: ${config.auth.jwtSecretKey ? "✅" : "❌"}`);
  console.log(`   JWT Refresh Secret: ${config.auth.jwtRefreshSecretKey ? "✅" : "❌"}`);
  console.log("\n");
}
