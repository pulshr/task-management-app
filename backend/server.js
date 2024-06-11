const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(
  "mongodb+srv://pulkit:pulkit@cluster0.co8buqy.mongodb.net/taskManagement"
);

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: {
    type: String,
    enum: ["To Do", "In Progress", "Done"],
    default: "To Do",
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Task = mongoose.model("Task", TaskSchema);
const User = mongoose.model("User", UserSchema);

const jwtSecret = "your_jwt_secret_key";

const authenticate = (req, res, next) => {
  const token = req.header("x-auth-token");
  if (!token)
    return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: "Token is not valid" });
  }
};

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  const user = await User.findOne({ username });
  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();

  const payload = { id: newUser.id };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: 3600 });

  res.json({ token, user: { id: newUser.id, username: newUser.username } });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "User does not exist" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const payload = { id: user.id };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: 3600 });

  res.json({ token, user: { id: user.id, username: user.username } });
});

app.get("/tasks", authenticate, async (req, res) => {
  const { status } = req.query;
  const query = { userId: req.user.id, ...(status && { status }) };
  const tasks = await Task.find(query);
  res.json(tasks);
});

app.post("/tasks", authenticate, async (req, res) => {
  const { title, description, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const task = new Task({ title, description, status, userId: req.user.id });
  await task.save();
  res.status(201).json(task);
});

app.put("/tasks/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }
  const task = await Task.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { title, description, status },
    { new: true }
  );
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.json(task);
});

app.delete("/tasks/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const task = await Task.findOneAndDelete({ _id: id, userId: req.user.id });
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.status(204).end();
});

app.listen(3001, () => {
  console.log("Server is running on http://localhost:3001");
});
