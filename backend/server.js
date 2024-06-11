const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Create the app and middleware
const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://pulkit:pulkit@cluster0.co8buqy.mongodb.net/taskManagement"
);

// Define the task schema and model
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ["To Do", "In Progress", "Done"],
    default: "To Do",
  },
});

const Task = mongoose.model("Task", TaskSchema);

// Define the CRUD routes
app.get("/tasks", async (req, res) => {
  const { status } = req.query;
  const query = status ? { status } : {};
  const tasks = await Task.find(query);
  res.json(tasks);
});

app.post("/tasks", async (req, res) => {
  const { title, description, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const task = new Task({ title, description, status });
  await task.save();
  res.status(201).json(task);
});

app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const task = await Task.findByIdAndUpdate(
    id,
    { title, description, status },
    { new: true }
  );
  res.json(task);
});

app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  res.status(204).end();
});

// Start the server
app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
