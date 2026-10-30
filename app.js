const express = require('express');
const app = express();
app.use(express.json()); // Parse JSON bodies

let todos = [
  { id: 1, task: 'Learn Node.js', completed: false },
  { id: 2, task: 'Build CRUD API', completed: false },
];

// Helper to generate next ID safely
const getNextId = () => {
  if (todos.length === 0) return 1;
  return Math.max(...todos.map((t) => t.id)) + 1;
};

// GET All Todos
app.get('/todos', (req, res) => {
  res.status(200).json(todos);
});

// BONUS: GET Active (incomplete) Todos
// Must come BEFORE /todos/:id
app.get('/todos/active', (req, res) => {
  const active = todos.filter((t) => !t.completed);
  res.status(200).json(active);
});

// GET Completed
app.get('/todos/completed', (req, res) => {
  const completed = todos.filter((t) => t.completed);
  res.status(200).json(completed);
});

// GET Single Todo by ID
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid ID' });
  }

  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  res.status(200).json(todo);
});

// POST – Create with Validation (task is required)
app.post('/todos', (req, res) => {
  const { task, completed = false } = req.body;

  if (!task || typeof task !== 'string' || task.trim() === '') {
    return res.status(400).json({
      error: 'Validation failed',
      message: 'The "task" field is required and must be a non-empty string',
    });
  }

  const newTodo = {
    id: getNextId(),
    task: task.trim(),
    completed: Boolean(completed),
  };

  todos.push(newTodo);
  res.status(201).json(newTodo);
});

// PUT – Full Update
app.put('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  const { task, completed } = req.body;

  if (!task || typeof task !== 'string' || task.trim() === '') {
    return res.status(400).json({
      message: 'The "task" field is required for full update',
    });
  }

  todos[index] = {
    id,
    task: task.trim(),
    completed: completed !== undefined ? Boolean(completed) : todos[index].completed,
  };

  res.status(200).json(todos[index]);
});

// PATCH – Partial Update
app.patch('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const todo = todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  Object.assign(todo, req.body);
  res.status(200).json(todo);
});

// DELETE
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const initialLength = todos.length;

  todos = todos.filter((t) => t.id !== id);

  if (todos.length === initialLength) {
    return res.status(404).json({ message: 'Todo not found' });
  }

  res.status(204).send();
});

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Server error!' });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => console.log(`Server on port ${PORT}`));
