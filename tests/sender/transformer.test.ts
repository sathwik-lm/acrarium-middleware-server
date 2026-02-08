import { transformToAcrarium } from '../../src/utils/acrarium-crash-transformer';

describe('Acrarium Transformer', () => {
    it('should transform crash data correctly', () => {
        const input = {
            eventId: 'test-123',
            message: 'Test crash',
            stackTrace: 'Error trace',
            rideviewAppVersion: '1.22.5',
            deviceId: '355748345036177',
            clientId: 'fc1prod',
            sdkVersion: '4.22.0',
            deviceModel: 'mitac-gemini',
            timestampUTC: '2026-01-12T08:19:47.319Z',
        };

        const result = transformToAcrarium(input);

        expect(result.REPORT_ID).toBe('test-123');
        expect(result.APP_VERSION_NAME).toBe('1.22.5');
        expect(result.INSTALLATION_ID).toBe('355748345036177');
        expect(result.BRAND).toBe('fc1prod');
        expect(result.STACK_TRACE).toBe('Error trace');
    });

    it('should generate defaults for missing fields', () => {
        const input = {
            eventId: 'test-456',
            message: 'Crash',
            stackTrace: 'Error',
        };

        const result = transformToAcrarium(input);

        expect(result.REPORT_ID).toBe('test-456');
        expect(result.APP_VERSION_NAME).toBe('unknown');
        expect(result.BRAND).toBe('unknown_client');
        expect(result.STACK_TRACE).toBe('Error');
    });
});