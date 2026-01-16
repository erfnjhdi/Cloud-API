const createApp = require("./app");
const config = require("./config");
const { initDb, closeDb } = require("./db/init");

async function start() {
  await initDb();

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`API listening on port ${config.port} (${config.env})`);
  });

  const shutdown = async (signal) => {
    try {
      console.log(`\nReceived ${signal}. Shutting down...`);
      server.close(async () => {
        await closeDb();
        console.log("Shutdown complete.");
        process.exit(0);
      });
    } catch (err) {
      console.error("Shutdown error:", err);
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});
