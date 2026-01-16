const express = require("express");
const router = express.Router();

const { run, get, all } = require("../db");
const { createTaskSchema, updateTaskSchema } = require("../schemas/taskSchemas");

function toTask(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? null,
    completed: Boolean(row.completed),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function badRequest(message, details) {
  const err = new Error(message);
  err.status = 400;
  if (details) err.details = details;
  return err;
}

function notFound(message = "Not found") {
  const err = new Error(message);
  err.status = 404;
  return err;
}

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limitRaw = parseInt(req.query.limit || "20", 10);
    const limit = Math.min(Math.max(limitRaw, 1), 100);
    const offset = (page - 1) * limit;

    const completed = req.query.completed;
    const q = (req.query.q || "").trim();

    const allowedSort = new Set(["created_at", "updated_at"]);
    const sort = allowedSort.has(req.query.sort) ? req.query.sort : "created_at";

    const order = String(req.query.order || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";

    const where = [];
    const params = [];

    if (completed === "true" || completed === "false") {
      where.push("completed = ?");
      params.push(completed === "true" ? 1 : 0);
    }

    if (q.length > 0) {
      where.push("(title LIKE ? OR description LIKE ?)");
      params.push(`%${q}%`, `%${q}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const countRow = await get(
      `SELECT COUNT(*) as count FROM tasks ${whereSql}`,
      params
    );

    const rows = await all(
      `SELECT * FROM tasks ${whereSql} ORDER BY ${sort} ${order} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      data: rows.map(toTask),
      meta: {
        page,
        limit,
        total: countRow?.count ?? 0,
        totalPages: Math.ceil((countRow?.count ?? 0) / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw badRequest("Task id must be an integer");

    const row = await get("SELECT * FROM tasks WHERE id = ?", [id]);
    if (!row) throw notFound("Task not found");

    res.json({ data: toTask(row) });
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest("Validation failed", parsed.error.flatten());
    }

    const { title, description, completed } = parsed.data;

    const result = await run(
      `INSERT INTO tasks (title, description, completed, created_at, updated_at)
       VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
      [title, description ?? null, completed ? 1 : 0]
    );

    const row = await get("SELECT * FROM tasks WHERE id = ?", [result.lastID]);

    res.status(201).json({ data: toTask(row) });
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw badRequest("Task id must be an integer");

    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      throw badRequest("Validation failed", parsed.error.flatten());
    }

    const existing = await get("SELECT * FROM tasks WHERE id = ?", [id]);
    if (!existing) throw notFound("Task not found");

    const updates = parsed.data;

    const set = [];
    const params = [];

    if (updates.title !== undefined) {
      set.push("title = ?");
      params.push(updates.title);
    }
    if (updates.description !== undefined) {
      set.push("description = ?");
      params.push(updates.description);
    }
    if (updates.completed !== undefined) {
      set.push("completed = ?");
      params.push(updates.completed ? 1 : 0);
    }

    if (set.length === 0) throw badRequest("No fields provided to update");

    set.push("updated_at = datetime('now')");

    await run(
      `UPDATE tasks SET ${set.join(", ")} WHERE id = ?`,
      [...params, id]
    );

    const row = await get("SELECT * FROM tasks WHERE id = ?", [id]);
    res.json({ data: toTask(row) });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) throw badRequest("Task id must be an integer");

    const result = await run("DELETE FROM tasks WHERE id = ?", [id]);
    if (result.changes === 0) throw notFound("Task not found");

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
