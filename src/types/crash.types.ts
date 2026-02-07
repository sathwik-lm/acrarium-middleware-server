import z from "zod";

export const crashSchema = z.object({
    eventId: z.string().optional(),
    message: z.string().optional(),
    stackTrace: z.string().optional(),
    rideviewAppVersion: z.string().optional(),
    deviceId: z.string().optional(),
    clientId: z.string().optional(),
}).passthrough();

export type CrashData = z.infer<typeof crashSchema>;