// Adapted from the supplied "WebDev II AS2 Multi Device Application" teaching document.
// AI-assisted changes: OpenAI ChatGPT/Codex. Prompt: "ok , lets go" in the
// context of repairing responsive CSS and connecting TaskFlowManager to Express.
import React, { useEffect, useState } from 'react';
import './App.css';
async function request(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json' } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'The server could not complete this request.');
  }
  return response.status === 204 ? null : response.json();
}
export default function TaskFlowManager() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Work');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  async function loadTasks() {
    setLoading(true); setError('');
    try { setTasks(await request('/api/tasks')); }
    catch { setError('Cannot connect to the server. Start the backend, then retry.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadTasks(); }, []);
  async function change(action, success) {
    setBusy(true); setError(''); setMessage('');
    try { await action(); setMessage(success); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  function handleAddTask(event) {
    event.preventDefault();
    if (!title.trim()) { setError('Please enter a task title.'); return; }
    change(async () => {
      const task = await request('/api/tasks', { method: 'POST', body: JSON.stringify({ title, category }) });
      setTasks(previous => [task, ...previous]); setTitle(''); setCategory('Work');
    }, 'Task added.');
  }
  function toggleComplete(task) {
    change(async () => {
      const updated = await request(`/api/tasks/${task.id}`, { method: 'PATCH', body: JSON.stringify({ completed: !task.completed }) });
      setTasks(previous => previous.map(item => item.id === task.id ? updated : item));
    }, 'Task status updated.');
  }
  function deleteTask(id) {
    change(async () => {
      await request(`/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(previous => previous.filter(task => task.id !== id));
    }, 'Task deleted.');
  }
  function clearAllTasks() {
    if (!window.confirm('Delete all tasks? This cannot be undone.')) return;
    change(async () => { await request('/api/tasks', { method: 'DELETE' }); setTasks([]); }, 'All tasks deleted.');
  }
  const completed = tasks.filter(task => task.completed).length;

  const filteredTasks = tasks.filter((task) => {
    const matchesCategory =
      categoryFilter === 'All' || task.category === categoryFilter;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Completed' && task.completed) ||
      (statusFilter === 'Active' && !task.completed);

    return matchesCategory && matchesStatus;
  });
  return <main className="task-app">
    <header className="app-header"><p className="eyebrow">WORK · STUDY · PERSONAL</p><h1>Task Flow Manager</h1><p>A little structure for your day.</p></header>
    {error && <div className="error" role="alert">{error} <button onClick={loadTasks} disabled={busy || loading}>Retry connection</button></div>}
    <p className="feedback" role="status">{message}</p>
    <div className="app-body">
      <section className="form-card" aria-labelledby="create-heading"><h2 id="create-heading">Create New Task</h2>
        <form onSubmit={handleAddTask}><fieldset disabled={busy || loading}>
          <div className="field-group"><label htmlFor="title">Task title</label><input id="title" value={title} onChange={event => setTitle(event.target.value)} maxLength={120} required placeholder="e.g., Complete UI mockup" /></div>
          <div className="field-group"><label htmlFor="category">Category</label><select id="category" value={category} onChange={event => setCategory(event.target.value)}><option>Work</option><option>Study</option><option>Personal</option></select></div>
          <button className="btn-primary" type="submit">{busy ? 'Saving…' : 'Add Task'}</button>
        </fieldset></form>
      </section>
      <section className="list-card" aria-labelledby="dashboard-heading"><div className="dashboard-header"><div><h2 id="dashboard-heading">Task Dashboard</h2><p>{completed} of {tasks.length} completed</p></div>{tasks.length > 0 && <button className="btn-secondary" onClick={clearAllTasks} disabled={busy || loading}>Clear all</button>}</div>
        <div className="task-filters">
          <div className="field-group">
            <label htmlFor="category-filter">Filter by category</label>
            <select
              id="category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
            >
              <option value="All">All categories</option>
              <option value="Work">Work</option>
              <option value="Study">Study</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div className="field-group">
            <label htmlFor="status-filter">Filter by status</label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="All">All tasks</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="empty">Loading tasks…</p>
        ) : tasks.length === 0 ? (
          <p className="empty">No tasks added yet. Start with one small step.</p>
        ) : filteredTasks.length === 0 ? (
          <p className="empty">No tasks match these filters.</p>
        ) :
          <ul className="task-grid">{filteredTasks.map(task => <li key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
            <div className="task-info"><span className={`badge ${task.category.toLowerCase()}`}>{task.category}</span><label className="task-title"><input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task)} disabled={busy || loading} /><span>{task.title}</span></label></div>
            <button className="btn-delete" onClick={() => deleteTask(task.id)} disabled={busy || loading} aria-label={`Delete ${task.title}`}>Delete</button>
          </li>)}</ul>}
      </section>
    </div>
  </main>;
}
