const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.DB_PATH = ":memory:";

const createApp = require("../src/app");
const { initDb, closeDb } = require("../src/db/init");

let app;

beforeAll(async () => {
  await initDb();
  app = createApp();
});

afterAll(async () => {
  await closeDb();
});

describe("Tasks API", () => {
  test("GET /health returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  test("POST /tasks creates a task", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({ title: "Study AWS", description: "EC2 + Docker" });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Study AWS");
    expect(res.body.data.completed).toBe(false);
  });

  test("GET /tasks lists tasks with meta", async () => {
    const res = await request(app).get("/tasks?limit=10&page=1");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toHaveProperty("total");
  });

  test("PUT /tasks/:id updates a task", async () => {
    const created = await request(app).post("/tasks").send({ title: "Old" });
    const id = created.body.data.id;

    const updated = await request(app)
      .put(`/tasks/${id}`)
      .send({ title: "New", completed: true });

    expect(updated.status).toBe(200);
    expect(updated.body.data.title).toBe("New");
    expect(updated.body.data.completed).toBe(true);
  });

  test("DELETE /tasks/:id deletes a task", async () => {
    const created = await request(app).post("/tasks").send({ title: "Delete me" });
    const id = created.body.data.id;

    const del = await request(app).delete(`/tasks/${id}`);
    expect(del.status).toBe(204);

    const getDeleted = await request(app).get(`/tasks/${id}`);
    expect(getDeleted.status).toBe(404);
  });

  test("Validation: POST /tasks requires title", async () => {
    const res = await request(app).post("/tasks").send({ description: "no title" });
    expect(res.status).toBe(400);
    expect(res.body.error.message).toMatch(/Validation/);
  });
});
