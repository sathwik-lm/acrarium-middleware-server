import request from 'supertest';
import express from 'express';
import controlRoutes from '../../src/routes/control.crash.routes';

jest.mock('../../src/config/elasticsearch', () => ({
  esClient: {
    cluster: {
      health: jest.fn().mockResolvedValue({
        status: 'green',
        number_of_nodes: 1,
      }),
    },
    count: jest.fn().mockResolvedValue({ count: 100 }),
    ping: jest.fn().mockResolvedValue(true),
  },
}));

jest.mock('../../src/config/redis', () => ({
  redisClient: {
    lLen: jest.fn().mockResolvedValue(50),
    lPop: jest.fn()
      .mockResolvedValueOnce('id1')
      .mockResolvedValueOnce('id2')
      .mockResolvedValueOnce(null),
    isOpen: true,
    connect: jest.fn().mockResolvedValue(true),
  },
}));

const app = express();
app.use(express.json());
app.use('/api/control', controlRoutes);

describe('Control API', () => {
  it('should get system status', async () => {
    const res = await request(app).get('/api/control/status');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('queue');
    expect(res.body).toHaveProperty('elasticsearch');
    expect(res.body).toHaveProperty('redis');
  });

  it('should get crash statistics', async () => {
    const res = await request(app).get('/api/control/stats');
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('pending');
    expect(res.body).toHaveProperty('sent');
    expect(res.body).toHaveProperty('failed');
  });

  it('should clear crash queue', async () => {
    const res = await request(app).delete('/api/control/queue/crash');
    
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Cleared');
  });
});