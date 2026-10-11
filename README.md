# Task Flow Manager — learning starter

React frontend and Express backend adapted from the supplied teaching document.
AI-assisted repairs and new code are explicitly marked. This is not a claim that
this complete project is student-authored or ready to submit unchanged. The
assessment limits external/AI-generated material to 25%; keep an honest record
of assistance and discuss use of the teaching starter with your tutor.

## Run on your computer
Install Node.js with npm. Open the extracted `task-flow-manager` folder in VS Code.

Terminal 1:
```sh
cd server
npm install
npm start
```
Terminal 2 (from the project root):
```sh
cd client
npm install
npm run dev
```
Open the Vite URL, normally http://localhost:5173. Keep both terminals running.

## Features
Add a task with Work, Study or Personal category; mark it complete; delete one;
clear all with confirmation. The frontend requests `/api/tasks`; Vite forwards
requests to Express on port 5000. Tasks are stored in `server/data/tasks.json`,
so refresh and server restart retain them. A retry button handles server failures.

## Files and routes
`client/src/main.jsx`: mounts React.
`client/src/App.jsx`: UI and HTTP requests.
`client/src/App.css`: mobile-first design, side-by-side at 768px.
`client/vite.config.js`: development API proxy.
`server/index.js`: GET/POST /api/tasks, PATCH/DELETE /api/tasks/:id,
DELETE /api/tasks, input validation and JSON-file persistence.

## Check yourself
- At 360px and 1280px, check for overflow and use keyboard navigation.
- Add a Study task, refresh, mark complete, refresh, then delete it.
- Stop/restart the server and check persistence; try adding a whitespace title.
- Stop the server, try an action, restart it and retry the connection.
- Check Clear all cancellation before confirming it.

## Limitations and assessment work remaining
Local single-user prototype: no authentication or multi-process database.
The Vite proxy is for local development; deployment needs separate configuration.
Review the code, implement and explain your own original changes, capture real
iterations/feedback, write the 1,000–1,500-word development document, and record
an actual 1–4-minute demo. Use the official Web Dev II repository, excluding
node_modules. Do not invent testing or peer feedback.
