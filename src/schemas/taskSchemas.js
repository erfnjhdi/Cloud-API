const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  completed: z.boolean().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).nullable().optional(), // allow null to clear
  completed: z.boolean().optional(),
});

module.exports = { createTaskSchema, updateTaskSchema };
