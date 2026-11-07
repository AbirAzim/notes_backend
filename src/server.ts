import mongoose from 'mongoose';
import { app } from './app';
import { env } from './config/env';

async function main() {
  await mongoose.connect(env.MONGO_URI);
  console.log('MongoDB connected');

  app.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
