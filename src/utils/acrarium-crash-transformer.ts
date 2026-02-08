import { randomUUID } from 'crypto';
import { CrashData } from '../types/crash.types';

function generateVersionCode(versionName: string): number {
    if (!versionName || typeof versionName !== 'string') {
        return 0;
    }
    const parts = versionName.split('+');
    const baseVersion = parts[0].trim();
    const suffix = parts[1] ? parts[1].trim().toLowerCase() : '';
    const versionParts = baseVersion.split('.').map(v => parseInt(v, 10) || 0);
    const major = versionParts[0] || 0;
    const minor = versionParts[1] || 0;
    const patch = versionParts[2] || 0;

    let versionCode = major * 10000 + minor * 100 + patch;

    if (suffix === 'audio') {
        versionCode += 1000;
    } else if (suffix) {
        let hash = 0;
        for (let i = 0; i < suffix.length; i++) {
            hash = ((hash << 5) - hash) + suffix.charCodeAt(i);
            hash = hash & hash;
        }
        versionCode += (Math.abs(hash) % 900) + 100;
    }

    return versionCode;
}

export function transformToAcrarium(input: CrashData) {
    const timestamp = input.timestampUtc || input.timestampUTC || new Date().toISOString();
    const clientId = input.clientId?.trim() || "unknown_client";
    const installationId = input.deviceId?.trim() || randomUUID();
    const appVersionName = input.rideviewAppVersion?.trim() || "unknown";

    let appVersionCode = generateVersionCode(appVersionName);

    if (isNaN(appVersionCode) || appVersionCode < 0) {
        appVersionCode = 0;
    }

    const androidVersion = input.sdkVersion?.trim() || "unknown";
    const stackTrace = input.stackTrace?.trim() || "UNKNOWN_STACK_TRACE";
    const reportId = input.eventId?.trim() || randomUUID();
    const phoneModel = input.deviceModel?.trim() || "";
    const runtimeDevice = input.runtimeDeviceModel?.trim() || "";
    const message = input.message?.trim() || "";

    return {
        REPORT_ID: reportId,
        APP_VERSION_NAME: appVersionName,
        APP_VERSION_CODE: appVersionCode,
        ANDROID_VERSION: androidVersion,
        PHONE_MODEL: phoneModel,
        INSTALLATION_ID: installationId,
        BUILD: {
            DEVICE: runtimeDevice || phoneModel
        },
        USER_COMMENT: message,
        STACK_TRACE: stackTrace,
        USER_CRASH_DATE: timestamp,
        APP_START_DATE: timestamp,
        BRAND: clientId,
        IS_SILENT: true,
        ...input
    };
}