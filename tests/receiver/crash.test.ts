import request from 'supertest';
import express from 'express';
import crashRoutes from '../../src/routes/reciver.crash.routes';

jest.mock('../../src/config/elasticsearch', () => ({
  esClient: {
    index: jest.fn().mockResolvedValue({ _id: 'test-id' }),
    ping: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../../src/config/redis', () => ({
  redisClient: {
    rPush: jest.fn().mockResolvedValue(1),
    connect: jest.fn().mockResolvedValue(true),
  },
}));

const app = express();
app.use(express.json());
app.use('/api', crashRoutes);

const mockCrashData = {
  message: "Attempt to read from field 'long lightmetrics.lib.LMSignInfo.downloadTimestamp' on a null object reference",
  eventId: "1768205987318-355748345036177-FEMA2XAIR3",
  stackTrace: "java.lang.NullPointerException...",
  rideviewAppVersion: "1.22.5",
  deviceId: "355748345036177",
  clientId: "fc1prod",
};

describe('Crash Receiver API', () => {
  it('should accept valid crash data with all fields', async () => {
    const res = await request(app)
      .post('/api/crash')
      .send(mockCrashData);
    
    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty('crashId');
    expect(res.body.crashId).toBe(mockCrashData.eventId);
  });

  it('should accept minimal crash data', async () => {
    const res = await request(app)
      .post('/api/crash')
      .send({
        eventId: 'test-123',
        message: 'Test crash',
        stackTrace: 'Error trace',
      });
    
    expect(res.status).toBe(202);
    expect(res.body).toHaveProperty('crashId');
  });

  it('should reject empty data', async () => {
    const res = await request(app)
      .post('/api/crash')
      .send({});
    
    expect(res.status).toBe(400);
  });
});