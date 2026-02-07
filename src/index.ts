import express from 'express';
import { env } from './env';
import { redisClient } from './config/redis';
import { esClient } from './config/elasticsearch';
const app = express();


app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Acrarium Middleware Application',
    status: 'running'
  });
});


async function startServer() {
  try {
    await redisClient.connect();
    await esClient.ping();
    console.log("esClient connected");
    app.listen(env.PORT, () => {
      console.log(` Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.log("Failed to start server", error);
    process.exit(1);
  }
}

startServer()


