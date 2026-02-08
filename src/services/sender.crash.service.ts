import * as http from 'http';
import { env } from '../env';
import { transformToAcrarium } from '../utils/acrarium-crash-transformer';
import { CrashData } from '../types/crash.types';

export class AcrariumService {
    private static readonly USERNAME = env.ACRARIUM_CRASH_ID;
    private static readonly PASSWORD = env.ACRARIUM_CRASH_PASSWORD;
    private static readonly HOSTNAME = env.ACRARIUM_HOSTNAME;
    private static readonly PORT = parseInt(env.ACRARIUM_PORT);
    private static readonly PATH = env.ACRARIUM_PATH;
    private static readonly TIMEOUT = 30000;

    static async sendCrash(crashData: CrashData): Promise<{ success: boolean; statusCode: number }> {
        return new Promise((resolve, reject) => {
            const payload = transformToAcrarium(crashData);
            const postData = JSON.stringify(payload);

            const auth = Buffer
                .from(`${this.USERNAME}:${this.PASSWORD}`)
                .toString("base64");

            const options = {
                hostname: this.HOSTNAME,
                port: this.PORT,
                path: this.PATH,
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(postData),
                    "Authorization": `Basic ${auth}`
                },
                timeout: this.TIMEOUT
            };

            const request = http.request(options, response => {
                let body = "";
                response.on("data", c => (body += c));
                response.on("end", () => {
                    const success = response.statusCode! >= 200 && response.statusCode! < 300;

                    if (!success) {
                        console.log(`FAILED | EventID: ${crashData.eventId} | Status: ${response.statusCode}`);
                    }

                    resolve({
                        success: success,
                        statusCode: response.statusCode!,
                    });
                });
            });

            request.on("error", err => reject(err));
            request.on("timeout", () => {
                request.destroy();
                reject(new Error("Request timeout"));
            });

            request.write(postData);
            request.end();
        });
    }
}