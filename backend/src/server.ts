import app from './app';
import { env } from './config/env';
import { connectDb } from './config/db';

async function main() {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`HelloWorld API listening on port ${env.port} [${env.nodeEnv}]`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
