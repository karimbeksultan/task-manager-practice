# Task Manager Web Application

A simple full-stack Task Manager built for a university educational project. It demonstrates CRUD operations, REST API design, SQLite persistence, search, filters, sorting, validation, error handling, loading states, and responsive UI.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: SQLite
- API style: REST

## Project Structure

```text
.
├── backend
│   ├── db
│   │   ├── database.js
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── middleware
│   │   └── errorHandler.js
│   ├── routes
│   │   └── tasks.js
│   ├── package.json
│   └── server.js
├── frontend
│   ├── src
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── package.json
└── README.md
```

## Setup Instructions

Make sure Node.js and npm are installed first. You can check with:

```bash
node -v
npm -v
```

## How a Supervisor Can Run the Project

After you push the project to GitHub, your supervisor can clone it and run it locally:

```bash
git clone https://github.com/YOUR_USERNAME/task-manager-practice.git
cd task-manager-practice
npm run install:all
npm run init-db --prefix backend
npm run dev
```

Then open:

```text
http://localhost:5173
```

Replace `YOUR_USERNAME` and `task-manager-practice` with your real GitHub username and repository name.

Install all dependencies from the project root:

```bash
npm run install:all
```

Initialize the SQLite database and insert sample data:

```bash
npm run init-db --prefix backend
```

Run both backend and frontend in development mode:

```bash
npm run dev
```

Open the frontend:

```text
http://localhost:5173
```

The backend runs at:

```text
http://localhost:5000
```

## Backend Only

```bash
cd backend
npm install
npm run init-db
npm run dev
```

## Frontend Only

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/tasks` | Get all tasks |
| GET | `/tasks/:id` | Get one task |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update a task |
| DELETE | `/tasks/:id` | Delete a task |

## Query Parameters

`GET /tasks` supports:

- `search`: search by task title
- `status`: `Pending`, `In Progress`, or `Completed`
- `priority`: `Low`, `Medium`, or `High`
- `sort`: `due_asc`, `due_desc`, `created_asc`, or `created_desc`

Example:

```text
http://localhost:5000/tasks?search=project&status=Pending&priority=High&sort=due_asc
```

## Database Initialization

The schema is located at:

```text
backend/db/schema.sql
```

Sample test data is located at:

```text
backend/db/seed.sql
```

Running `npm run init-db --prefix backend` creates:

```text
backend/db/tasks.sqlite
```

## Features

- Add, view, edit, and delete tasks
- Confirmation before deleting
- One-click mark as completed
- Search by title
- Filter by status and priority
- Sort by due date
- Dashboard counters for total, pending, completed, and high-priority tasks
- Color-coded priorities
- Empty state when no tasks exist
- Responsive desktop and mobile layout
- Success and error notifications
