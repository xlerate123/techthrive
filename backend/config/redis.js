const { createClient } = require('redis');

/**
 * Redis client for caching frequently accessed product data
 * Connected to Redis Cloud (RedisLabs) with TLS
 */
const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;
const redisUsername = process.env.REDIS_USERNAME;
const redisPassword = process.env.REDIS_PASSWORD;

const client = createClient({
  username: redisUsername,
  password: redisPassword,
  socket: {
    host: redisHost,
    port: redisPort,
    connectTimeout: 10000,
  },
});

client.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

client.on("connect", () => {
  console.log("Connected to Redis Cloud successfully");
});

module.exports = client;