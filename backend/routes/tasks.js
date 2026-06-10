import express from "express";
import { all, get, run } from "../db/database.js";

const router = express.Router();

const allowedPriorities = ["Low", "Medium", "High"];
const allowedStatuses = ["Pending", "In Progress", "Completed"];
const allowedSorts = {
  due_asc: "due_date IS NULL, due_date ASC",
  due_desc: "due_date IS NULL, due_date DESC",
  created_asc: "created_at ASC",
  created_desc: "created_at DESC"
};

// Shared validation protects both create and update operations.
function validateTaskInput(body, isUpdate = false) {
  const errors = [];
  const title = typeof body.title === "string" ? body.title.trim() : "";

  if (!isUpdate || Object.hasOwn(body, "title")) {
    if (!title) {
      errors.push("Title is required.");
    }
  }

  if (body.priority && !allowedPriorities.includes(body.priority)) {
    errors.push("Priority must be Low, Medium, or High.");
  }

  if (body.status && !allowedStatuses.includes(body.status)) {
    errors.push("Status must be Pending, In Progress, or Completed.");
  }

  if (body.due_date && Number.isNaN(Date.parse(body.due_date))) {
    errors.push("Due date must be a valid date.");
  }

  return errors;
}

// Builds a safe filtered query using placeholders instead of string-concatenated user input.
function buildTaskQuery(query) {
  const conditions = [];
  const params = [];

  if (query.search) {
    conditions.push("LOWER(title) LIKE ?");
    params.push(`%${query.search.toLowerCase()}%`);
  }

  if (query.status) {
    conditions.push("status = ?");
    params.push(query.status);
  }

  if (query.priority) {
    conditions.push("priority = ?");
    params.push(query.priority);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderClause = allowedSorts[query.sort] || allowedSorts.created_desc;

  return {
    sql: `SELECT * FROM tasks ${whereClause} ORDER BY ${orderClause}`,
    params
  };
}

router.get("/", async (req, res, next) => {
  try {
    const { sql, params } = buildTaskQuery(req.query);
    const tasks = await all(sql, params);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const task = await get("SELECT * FROM tasks WHERE id = ?", [req.params.id]);

    if (!task) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const errors = validateTaskInput(req.body);
    if (errors.length) {
      res.status(400).json({ error: errors.join(" ") });
      return;
    }

    const title = req.body.title.trim();
    const description = req.body.description?.trim() || "";
    const priority = req.body.priority || "Medium";
    const status = req.body.status || "Pending";
    const dueDate = req.body.due_date || null;

    const result = await run(
      `INSERT INTO tasks (title, description, priority, status, due_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [title, description, priority, status, dueDate]
    );

    const task = await get("SELECT * FROM tasks WHERE id = ?", [result.id]);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const existingTask = await get("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
    if (!existingTask) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    const errors = validateTaskInput(req.body, true);
    if (errors.length) {
      res.status(400).json({ error: errors.join(" ") });
      return;
    }

    const updatedTask = {
      title: Object.hasOwn(req.body, "title") ? req.body.title.trim() : existingTask.title,
      description: Object.hasOwn(req.body, "description")
        ? req.body.description?.trim() || ""
        : existingTask.description,
      priority: req.body.priority || existingTask.priority,
      status: req.body.status || existingTask.status,
      due_date: Object.hasOwn(req.body, "due_date") ? req.body.due_date || null : existingTask.due_date
    };

    await run(
      `UPDATE tasks
       SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        updatedTask.title,
        updatedTask.description,
        updatedTask.priority,
        updatedTask.status,
        updatedTask.due_date,
        req.params.id
      ]
    );

    const savedTask = await get("SELECT * FROM tasks WHERE id = ?", [req.params.id]);
    res.json(savedTask);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const result = await run("DELETE FROM tasks WHERE id = ?", [req.params.id]);

    if (!result.changes) {
      res.status(404).json({ error: "Task not found" });
      return;
    }

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
