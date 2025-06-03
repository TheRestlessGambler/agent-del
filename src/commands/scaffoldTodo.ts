import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export async function scaffoldTodo() {
  // Prompt user for project folder path
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    vscode.window.showErrorMessage('Open your React project folder first.');
    return;
  }

  const projectPath = workspaceFolders[0].uri.fsPath;

  // Path to src/components inside the React app
  const componentsDir = path.join(projectPath, 'src', 'components');

  // Ensure components folder exists
  if (!fs.existsSync(componentsDir)) {
    fs.mkdirSync(componentsDir, { recursive: true });
  }

  // Sample ToDo component code (basic example)
  const todoComponentCode = `import React, { useState } from 'react';

export default function Todo() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');

  function addTask() {
    if (!input) return;
    setTasks([...tasks, { text: input, done: false }]);
    setInput('');
  }

  function toggleDone(index) {
    const newTasks = [...tasks];
    newTasks[index].done = !newTasks[index].done;
    setTasks(newTasks);
  }

  function deleteTask(index) {
    setTasks(tasks.filter((_, i) => i !== index));
  }

  return (
    <div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="New task"
      />
      <button onClick={addTask}>Add</button>
      <ul>
        {tasks.map((task, i) => (
          <li key={i} style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
            <span onClick={() => toggleDone(i)}>{task.text}</span>
            <button onClick={() => deleteTask(i)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
`;

  // Write the ToDo component file
  const todoFilePath = path.join(componentsDir, 'Todo.tsx');
  try {
    fs.writeFileSync(todoFilePath, todoComponentCode);
    vscode.window.showInformationMessage('ToDo component created at src/components/Todo.tsx');
  } catch (err) {
    vscode.window.showErrorMessage(`Failed to create ToDo component: ${err}`);
  }
}
