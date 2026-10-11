// AI-assisted implementation: OpenAI ChatGPT/Codex.
// Prompt: "ok , lets go" following a request to repair TaskFlowManager,
// connect React to an Express API, and verify the project.
// This is a learning starter; disclose assistance rather than claiming authorship.
const express = require('express');
const cors = require('cors');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const app = express();
const dataFile = process.env.TASK_DATA_FILE || path.join(__dirname, 'data', 'tasks.json');
fs.mkdirSync(path.dirname(dataFile), { recursive: true });
let tasks = fs.existsSync(dataFile) ? JSON.parse(fs.readFileSync(dataFile, 'utf8')) : [];
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '16kb' }));
// Commit to disk before updating memory, so a failed write does not report success.
function save(next) {
  const temporary = `${dataFile}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(next, null, 2));
  fs.renameSync(temporary, dataFile);
  tasks = next;
}
app.get('/api/tasks', (req, res) => res.json(tasks));
app.post('/api/tasks', (req, res) => {
  const { title, category } = req.body || {};
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 120)
    return res.status(400).json({ error: 'Enter a title between 1 and 120 characters.' });
  if (!['Work', 'Study', 'Personal'].includes(category))
    return res.status(400).json({ error: 'Choose a valid category.' });
  const task = { id: randomUUID(), title: title.trim(), category, completed: false };
  save([task, ...tasks]);
  res.status(201).json(task);
});
app.patch('/api/tasks/:id', (req, res) => {
  const task = tasks.find(task => task.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found.' });
  if (typeof req.body?.completed !== 'boolean')
    return res.status(400).json({ error: 'Completed must be true or false.' });
  const updated = { ...task, completed: req.body.completed };
  save(tasks.map(item => item.id === task.id ? updated : item));
  res.json(updated);
});
app.delete('/api/tasks/:id', (req, res) => {
  if (!tasks.some(task => task.id === req.params.id))
    return res.status(404).json({ error: 'Task not found.' });
  save(tasks.filter(task => task.id !== req.params.id));
  res.sendStatus(204);
});
app.delete('/api/tasks', (req, res) => { save([]); res.sendStatus(204); });
app.use((error, req, res, next) => {
  console.error(error.message);
  res.status(error.status === 400 ? 400 : 500).json({ error: error.status === 400 ? 'Invalid JSON request.' : 'Server could not save your changes.' });
});
app.listen(process.env.PORT || 5000, () => console.log('Task API running on http://localhost:' + (process.env.PORT || 5000)));
