import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3000),
    DATABASE_URL: z.string().min(1, "Database URL is required"),
    ELASTICSEARCH_NODE: z.string().url(),
    JWT_SECRET_KEY: z.string().min(32, "JWT secret must be at least 32 characters"),
  },

  clientPrefix: "PUBLIC_",
  client: {},

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
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
    jwtSecretKey: env.JWT_SECRET_KEY,
  },
} as const;

if (config.isDevelopment) {
  console.log("\n🔧 Configuration:");
  console.log(`   Port: ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Database: ${config.database.url ? "✅" : "❌"}`);
  console.log(`   Elasticsearch: ${config.elasticsearch.node}\n`);
}