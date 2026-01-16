const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const tasksRouter = require("./routes/tasks");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("combined"));
  }

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/tasks", tasksRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = createApp;
