const sqlite3 = require("sqlite3");
const config = require("../config");

sqlite3.verbose();

let db;

function getDb() {
  if (db) return db;

  db = new sqlite3.Database(config.dbPath, (err) => {
    if (err) {
      console.error("Failed to connect to SQLite:", err);
      throw err;
    }
  });

  db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON;");
    db.run("PRAGMA journal_mode = WAL;");
    db.run("PRAGMA synchronous = NORMAL;");
  });

  return db;
}

function run(sql, params = []) {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  const database = getDb();
  return new Promise((resolve, reject) => {
    database.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function close() {
  if (!db) return Promise.resolve();
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) return reject(err);
      db = undefined;
      resolve();
    });
  });
}

module.exports = { getDb, run, get, all, close };
