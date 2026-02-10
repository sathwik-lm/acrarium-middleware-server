import express from 'express';
import { env } from './env';
import { redisClient } from './config/redis';
import { esClient } from './config/elasticsearch';
import crashRouter from './routes/reciver.crash.routes';
import controlRouter from './routes/control.crash.routes';
import workerRoutes from './routes/worker.routes';
import { WorkerManager } from './services/worker-management';

const app = express();


app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Acrarium Middleware Application',
    status: 'running'
  });
});

app.use('/api', crashRouter);
app.use('/api/control', controlRouter)
app.use('/api/workers', workerRoutes);

async function startServer() {
  try {
    await redisClient.connect();
    await esClient.ping();
    console.log(" Elasticsearch connected");
    app.listen(env.PORT, () => {
      console.log(` Server running on http://localhost:${env.PORT}`);
    });
    setInterval(() => {
      WorkerManager.autoScale();
    }, 30000);

    console.log(' Auto-scaling enabled');
  } catch (error) {
    console.log("Failed to start server", error);
    process.exit(1);
  }
}

startServer()


