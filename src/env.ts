import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(8000),
    ELASTICSEARCH_NODE: z.string().url(),
    ACRARIUM_HOSTNAME: z.string(),
    ACRARIUM_PORT: z.string(),
    ACRARIUM_PATH: z.string(),
    ACRARIUM_CRASH_ID: z.string(),
    ACRARIUM_CRASH_PASSWORD: z.string(),
    ACRARIUM_ENGINECRASH_ID: z.string(),
    ACRARIUM_ENGINECRASH_PASSWORD: z.string(),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
  },

  clientPrefix: "PUBLIC_",
  client: {},

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE,
    ACRARIUM_HOSTNAME: process.env.ACRARIUM_HOSTNAME,
    ACRARIUM_PORT: process.env.ACRARIUM_PORT,
    ACRARIUM_PATH: process.env.ACRARIUM_PATH,
    ACRARIUM_CRASH_ID: process.env.ACRARIUM_BASE_URL,
    ACRARIUM_CRASH_PASSWORD: process.env.ACRARIUM_CRASH_PASSWORD,
    ACRARIUM_ENGINECRASH_ID: process.env.ACRARIUM_ENGINECRASH_ID,
    ACRARIUM_ENGINECRASH_PASSWORD: process.env.ACRARIUM_ENGINECRASH_PASSWORD,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_USER: process.env.EMAIL_USER,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

export const config = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === "development",
  isProduction: env.NODE_ENV === "production",

  elasticsearch: {
    node: env.ELASTICSEARCH_NODE,
  },

  acrarium: {
    base_host: env.ACRARIUM_HOSTNAME,
    ac_port: env.ACRARIUM_PORT,
    ac_path: env.ACRARIUM_PATH,
    crash_ID: env.ACRARIUM_CRASH_ID,
    crash_pass: env.ACRARIUM_CRASH_PASSWORD,
    engine_crash_ID: env.ACRARIUM_ENGINECRASH_ID,
    engine_crash_pass: env.ACRARIUM_ENGINECRASH_PASSWORD
  },

  email: {
    emailId: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
} as const;

if (config.isDevelopment) {
  console.log("\n🔧 Configuration:");
  console.log(`   Port: ${config.port}`);
  console.log(`   Environment: ${config.nodeEnv}`);
  console.log(`   Elasticsearch: ${config.elasticsearch.node ? "✅" : "❌"}`);
  console.log("\n");
}
