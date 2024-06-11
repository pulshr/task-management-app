import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("To Do");
  const [filter, setFilter] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState("");

  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;

    const response = await axios.get("http://localhost:3001/tasks", {
      params: { status: filter },
      headers: { "x-auth-token": token },
    });
    setTasks(response.data);
  }, [filter, isAuthenticated, token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const register = async () => {
    const response = await axios.post("http://localhost:3001/register", {
      username,
      password,
    });
    setToken(response.data.token);
    setIsAuthenticated(true);
  };

  const login = async () => {
    const response = await axios.post("http://localhost:3001/login", {
      username,
      password,
    });
    setToken(response.data.token);
    setIsAuthenticated(true);
  };

  const createTask = async () => {
    if (!title) {
      alert("Title is required");
      return;
    }
    await axios.post(
      "http://localhost:3001/tasks",
      { title, description, status },
      {
        headers: { "x-auth-token": token },
      }
    );
    setTitle("");
    setDescription("");
    setStatus("To Do");
    fetchTasks();
  };

  const updateTask = async (id, newStatus) => {
    await axios.put(
      `http://localhost:3001/tasks/${id}`,
      { status: newStatus },
      {
        headers: { "x-auth-token": token },
      }
    );
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`http://localhost:3001/tasks/${id}`, {
      headers: { "x-auth-token": token },
    });
    fetchTasks();
  };

  return (
    <div className="App">
      <h1>Task Manager</h1>
      {!isAuthenticated ? (
        <div className="auth-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={register}>Register</button>
          <button onClick={login}>Login</button>
        </div>
      ) : (
        <>
          <div className="task-form">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <button onClick={createTask}>Add Task</button>
          </div>
          <div className="filter">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div className="task-list">
            {tasks.map((task) => (
              <div key={task._id} className="task">
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>Status: {task.status}</p>
                <div className="task-actions">
                  {task.status !== "To Do" && (
                    <button onClick={() => updateTask(task._id, "To Do")}>
                      To Do
                    </button>
                  )}
                  {task.status !== "In Progress" && (
                    <button onClick={() => updateTask(task._id, "In Progress")}>
                      In Progress
                    </button>
                  )}
                  {task.status !== "Done" && (
                    <button onClick={() => updateTask(task._id, "Done")}>
                      Done
                    </button>
                  )}
                  <button onClick={() => deleteTask(task._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
