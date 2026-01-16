const { run, close } = require("./index");

async function initDb() {
  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  await run(`CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);`);
  await run(`CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);`);
}

async function closeDb() {
  await close();
}

module.exports = { initDb, closeDb };
