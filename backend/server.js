import 'dotenv/config';
import app from './app.js';
import { connectDB, logger } from './config/db.config.js';

const PORT = process.env.PORT || 8888;

const startServer = async () => {
  // Try database connection
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`===================================================`);
    logger.info(`   J.A.R.V.I.S. Server running on port ${PORT}`);
    logger.info(`   Host URL: http://localhost:${PORT}`);
    logger.info(`   Press Ctrl+C to terminate connection`);
    logger.info(`===================================================`);
  });
};

startServer().catch((err) => {
  logger.error(`Critical server launch failure: ${err.message}`);
  process.exit(1);
});
