INSERT INTO tasks (title, description, priority, status, due_date, created_at, updated_at)
VALUES
  (
    'Prepare database presentation',
    'Create slides explaining SQLite schema and CRUD operations.',
    'High',
    'In Progress',
    '2026-06-15',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'Review React components',
    'Check form state, list rendering, and responsive layout.',
    'Medium',
    'Pending',
    '2026-06-18',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'Submit project report',
    'Write setup steps, screenshots, and final notes.',
    'High',
    'Pending',
    '2026-06-25',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'Clean completed test cases',
    'Remove duplicate manual test notes after demo preparation.',
    'Low',
    'Completed',
    '2026-06-09',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );
