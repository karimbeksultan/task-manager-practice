import express from "express";
import cors from "cors";
import taskRoutes from "./routes/tasks.js";
import { initializeDatabase } from "./db/database.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Task Manager API is running" });
});

app.use("/tasks", taskRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Task Manager API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error.message);
    process.exit(1);
  });
