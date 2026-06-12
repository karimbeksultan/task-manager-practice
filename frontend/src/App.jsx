import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const emptyForm = {
  title: "",
  description: "",
  priority: "Medium",
  due_date: "",
  status: "Pending"
};

const defaultFilters = {
  search: "",
  status: "",
  priority: "",
  sort: "due_asc"
};

function formatDate(value) {
  if (!value) return "No due date";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function normalizeDateForInput(value) {
  if (!value) return "";
  return value.slice(0, 10);
}

function getDueState(task) {
  if (!task.due_date || task.status === "Completed") return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(task.due_date);
  dueDate.setHours(0, 0, 0, 0);

  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0) return "overdue";
  if (daysUntilDue <= 3) return "soon";
  return null;
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [dashboardTasks, setDashboardTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filters, setFilters] = useState(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  // Dashboard values are derived from all saved tasks, not only the filtered view.
  const dashboard = useMemo(() => {
    return {
      total: dashboardTasks.length,
      pending: dashboardTasks.filter((task) => task.status === "Pending").length,
      inProgress: dashboardTasks.filter((task) => task.status === "In Progress").length,
      completed: dashboardTasks.filter((task) => task.status === "Completed").length,
      high: dashboardTasks.filter((task) => task.priority === "High").length
    };
  }, [dashboardTasks]);

  // Reads tasks from the REST API using the current search, filter, and sort values.
  async function fetchTasks() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const [response, dashboardResponse] = await Promise.all([
        fetch(`${API_URL}/tasks?${params.toString()}`),
        fetch(`${API_URL}/tasks`)
      ]);
      const data = await response.json();
      const dashboardData = await dashboardResponse.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load tasks.");
      }

      if (!dashboardResponse.ok) {
        throw new Error(dashboardData.error || "Failed to load dashboard.");
      }

      setTasks(data);
      setDashboardTasks(dashboardData);
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  function showNotification(message, type = "success") {
    setNotification({ message, type });
    window.clearTimeout(showNotification.timeoutId);
    showNotification.timeoutId = window.setTimeout(() => setNotification(null), 3000);
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  // One form handles both create and edit mode.
  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      showNotification("Task title is required.", "error");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${API_URL}/tasks${editingId ? `/${editingId}` : ""}`, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          description: form.description.trim()
        })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save task.");
      }

      showNotification(editingId ? "Task updated successfully." : "Task added successfully.");
      resetForm();
      fetchTasks();
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  function startEditing(task) {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      due_date: normalizeDateForInput(task.due_date),
      status: task.status
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteTask() {
    if (!taskToDelete) return;
    try {
      const response = await fetch(`${API_URL}/tasks/${taskToDelete.id}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to delete task.");
      }

      showNotification("Task deleted successfully.");
      setTaskToDelete(null);
      fetchTasks();
    } catch (error) {
      showNotification(error.message, "error");
    }
  }

  // Sends a normal update request with only the status changed.
  async function markCompleted(task) {
    try {
      const response = await fetch(`${API_URL}/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, status: "Completed" })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to complete task.");
      }

      showNotification("Task marked as completed.");
      fetchTasks();
    } catch (error) {
      showNotification(error.message, "error");
    }
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <ClipboardList size={28} />
          <span>Task Manager</span>
        </div>
      </nav>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
          <button aria-label="Close notification" onClick={() => setNotification(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      <main className="shell">
        <section className="dashboard" aria-label="Task dashboard">
          <DashboardCard label="Total Tasks" value={dashboard.total} />
          <DashboardCard label="Pending Tasks" value={dashboard.pending} />
          <DashboardCard label="In Progress" value={dashboard.inProgress} />
          <DashboardCard label="Completed Tasks" value={dashboard.completed} />
          <DashboardCard label="High Priority" value={dashboard.high} />
        </section>

        <section className="workspace">
          <form className="task-form" onSubmit={handleSubmit}>
            <div className="section-heading">
              <h1>{editingId ? "Edit Task" : "Add Task"}</h1>
              {editingId && (
                <button type="button" className="ghost-button" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>

            <label>
              Title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter task title"
                required
              />
            </label>

            <label>
              Description
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Optional task details"
                rows="4"
              />
            </label>

            <div className="form-grid">
              <label>
                Priority
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>

              <label>
                Status
                <select name="status" value={form.status} onChange={handleChange}>
                  <option>Pending</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </label>
            </div>

            <label>
              Due Date
              <input name="due_date" type="date" value={form.due_date} onChange={handleChange} />
            </label>

            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? <Loader2 className="spin" size={18} /> : <Plus size={18} />}
              {editingId ? "Update Task" : "Add Task"}
            </button>
          </form>

          <section className="task-panel">
            <div className="section-heading">
              <h2>Tasks</h2>
              {loading && <Loader2 className="spin muted" size={22} />}
            </div>

            <div className="filters">
              <label className="search-box">
                <Search size={18} />
                <input
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by title"
                />
              </label>

              <select name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All statuses</option>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>

              <select name="priority" value={filters.priority} onChange={handleFilterChange}>
                <option value="">All priorities</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <select name="sort" value={filters.sort} onChange={handleFilterChange}>
                <option value="due_asc">Due date: earliest</option>
                <option value="due_desc">Due date: latest</option>
                <option value="created_desc">Newest created</option>
                <option value="created_asc">Oldest created</option>
              </select>

              <button type="button" className="clear-button" onClick={clearFilters}>
                Clear
              </button>
            </div>

            {!loading && tasks.length === 0 ? (
              <div className="empty-state">
                <CalendarDays size={42} />
                <h3>No tasks found</h3>
                <p>Add a task or change your search and filters.</p>
              </div>
            ) : (
              <div className="task-list">
                {tasks.map((task) => {
                  const dueState = getDueState(task);

                  return (
                    <article className="task-card" key={task.id}>
                      <div className="task-main">
                        <div>
                          <h3>{task.title}</h3>
                          {task.description && <p>{task.description}</p>}
                        </div>
                        <div className="task-badges">
                          {dueState === "overdue" && <span className="due-badge overdue">Overdue</span>}
                          {dueState === "soon" && <span className="due-badge soon">Due soon</span>}
                          <span className={`priority ${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>

                      <div className="task-meta">
                        <span>{task.status}</span>
                        <span>Due: {formatDate(task.due_date)}</span>
                        <span>Created: {formatDate(task.created_at)}</span>
                      </div>

                      <div className="task-actions">
                        {task.status !== "Completed" && (
                          <button type="button" onClick={() => markCompleted(task)}>
                            <CheckCircle2 size={16} />
                            Complete
                          </button>
                        )}
                        <button type="button" onClick={() => startEditing(task)}>
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button type="button" className="danger" onClick={() => setTaskToDelete(task)}>
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </main>

      {taskToDelete && (
        <div className="modal-backdrop" role="presentation">
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="delete-title">
            <div className="modal-icon">
              <AlertTriangle size={24} />
            </div>
            <h2 id="delete-title">Delete task?</h2>
            <p>
              This will permanently remove <strong>{taskToDelete.title}</strong> from the database.
            </p>
            <div className="modal-actions">
              <button type="button" className="ghost-button" onClick={() => setTaskToDelete(null)}>
                Cancel
              </button>
              <button type="button" className="danger-button" onClick={deleteTask}>
                Delete Task
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function DashboardCard({ label, value }) {
  return (
    <article className="dashboard-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
