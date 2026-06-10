import fs from "fs";
import path from "path";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "tasks.sqlite");
const schemaPath = path.join(__dirname, "schema.sql");
const seedPath = path.join(__dirname, "seed.sql");

sqlite3.verbose();

export const db = new sqlite3.Database(dbPath);

// Small Promise wrappers keep route handlers readable with async/await.
export function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function handleRun(error) {
      if (error) {
        reject(error);
        return;
      }

      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(row);
    });
  });
}

export function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(rows);
    });
  });
}

export async function initializeDatabase() {
  const schema = fs.readFileSync(schemaPath, "utf8");
  await run("PRAGMA foreign_keys = ON");

  return new Promise((resolve, reject) => {
    db.exec(schema, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });
}

// Used by the setup script to recreate the table and insert demo records.
async function resetAndSeedDatabase() {
  const schema = fs.readFileSync(schemaPath, "utf8");
  const seed = fs.readFileSync(seedPath, "utf8");

  await new Promise((resolve, reject) => {
    db.exec(`DROP TABLE IF EXISTS tasks; ${schema} ${seed}`, (error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

  console.log(`Database initialized with sample data at ${dbPath}`);
}

if (process.argv.includes("--init")) {
  resetAndSeedDatabase()
    .then(() => db.close())
    .catch((error) => {
      console.error("Database initialization failed:", error.message);
      db.close();
      process.exit(1);
    });
}
