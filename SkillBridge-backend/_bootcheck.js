require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

(async () => {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  const app = require('./src/app');
  await new Promise((resolve, reject) => {
    const server = app.listen(0, () => resolve(server));
    server.on('error', reject);
  });
  const port = app.listen().address().port;
  // start server.js connectDB path instead
})().catch(e => { console.error('BOOT FAIL', e); process.exit(1); });
