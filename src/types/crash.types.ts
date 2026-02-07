import { z } from 'zod';

export const crashSchema = z.object({
    eventId: z.string(),
    stackTrace: z.string(),
    message: z.string(),
    timestampUTC: z.string().optional(),
    rideviewAppVersion: z.string().optional(),
    deviceId: z.string().optional(),
    clientId: z.string().optional(),
    deviceModel: z.string().optional(),
    sdkVersion: z.string().optional(),
    runtimeDeviceModel: z.string().optional(),
    firmware0Semver: z.string().optional(),
    firmware2Semver: z.string().optional(),
    cpuTemperature: z.number().optional(),
    gpuTemperature: z.number().optional(),
    boardTemperature: z.number().optional(),
    regionImageVersion: z.string().optional(),
    eventType: z.string().optional(),
    bootId: z.string().optional(),
    lmSessionId: z.string().optional(),
    firmwareVersion: z.string().optional(),
    timezoneOffset: z.number().optional(),
    timeZoneId: z.string().optional(),
    stackTraceId: z.number().optional(),
    uploadedAt: z.string().optional(),
}).passthrough();

export type CrashData = z.infer<typeof crashSchema>;