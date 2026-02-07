import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(8000),
    ELASTICSEARCH_NODE: z.string().url(),
    EMAIL_USER: z.string(),
    EMAIL_PASS: z.string(),
  },

  clientPrefix: "PUBLIC_",
  client: {},

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    ELASTICSEARCH_NODE: process.env.ELASTICSEARCH_NODE,
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
