import express from 'express';
import { PrismaClient } from '@prisma/client';
import { env } from './env';

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ 
    message: 'Crash Analytics API',
    status: 'running'
  });
});



app.listen(env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${env.PORT}`);
});