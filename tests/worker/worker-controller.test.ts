import request from 'supertest';
import express from 'express';
import workerRoutes from '../../src/routes/worker.routes';


jest.mock('../../src/services/worker-management', () => ({
  WorkerManager: {
    startSenderWorker: jest.fn().mockReturnValue(true),
    stopSenderWorker: jest.fn().mockReturnValue(true),
    startCleanupWorker: jest.fn().mockReturnValue(true),
    stopCleanupWorker: jest.fn().mockReturnValue(true),
    startMonitorWorker: jest.fn().mockReturnValue(true),
    stopMonitorWorker: jest.fn().mockReturnValue(true),
    getWorkersStatus: jest.fn().mockReturnValue({
      senders: [],
      cleanup: { running: false },
      monitor: { running: false },
    }),
    stopAll: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/workers', workerRoutes);

describe('Worker Controller API', () => {
  it('should start sender worker', async () => {
    const res = await request(app)
      .post('/api/workers/sender/start')
      .send({ workerId: 'test' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should stop sender worker', async () => {
    const res = await request(app)
      .post('/api/workers/sender/stop')
      .send({ workerId: 'test' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should start cleanup worker', async () => {
    const res = await request(app).post('/api/workers/cleanup/start');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should get workers status', async () => {
    const res = await request(app).get('/api/workers/status');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('senders');
    expect(res.body).toHaveProperty('cleanup');
    expect(res.body).toHaveProperty('monitor');
  });

  it('should stop all workers', async () => {
    const res = await request(app).post('/api/workers/stop-all');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});