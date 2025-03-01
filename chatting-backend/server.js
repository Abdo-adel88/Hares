const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*", // السماح لجميع المصادر بالاتصال
    methods: ["GET", "POST"],
  },
});

app.use(bodyParser.json());
app.use(cors());

const SECRET_KEY = "your_secret_key";
const users = []; // قائمة المستخدمين
const messages = {}; // تخزين الرسائل بشكل منفصل لكل مستخدم
const onlineUsers = {}; // قائمة المستخدمين المتصلين

// تسجيل مستخدم جديد
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (users.find((user) => user.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, email, password: hashedPassword };
  users.push(newUser);

  // إنشاء مساحة للمحادثات الخاصة بالمستخدم الجديد
  messages[newUser.email] = [];

  res.status(201).json({ message: "User registered successfully" });
});

// تسجيل الدخول
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find((user) => user.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });

  res.status(200).json({ message: "Login successful", token, userId: user.id, email: user.email });
});

// جلب جميع المستخدمين (باستثناء المستخدم الحالي)
app.get("/users/:email", (req, res) => {
  const userEmail = req.params.email;
  const filteredUsers = users.filter((user) => user.email !== userEmail);
  res.status(200).json(filteredUsers);
});

// جلب المحادثات الخاصة بمستخدم معين
app.get("/messages/:email", (req, res) => {
  const email = req.params.email;
  res.status(200).json(messages[email] || []);
});

// حذف رسالة معينة
app.post("/delete-message", (req, res) => {
  const { sender, recipient, message } = req.body;

  if (messages[sender]) {
    messages[sender] = messages[sender].filter(
      (msg) => !(msg.recipient === recipient && msg.message === message)
    );
  }

  if (messages[recipient]) {
    messages[recipient] = messages[recipient].filter(
      (msg) => !(msg.sender === sender && msg.message === message)
    );
  }

  res.status(200).json({ message: "Message deleted successfully" });
});

// Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("register-user", (email) => {
    onlineUsers[email] = socket.id;
    console.log(`User ${email} is online`);
  });



socket.on("send-message", (data) => {
  const { sender, recipient, message } = data;
  const recipientSocketId = onlineUsers[recipient];

  const newMessage = { sender, recipient, message, timestamp: new Date().toISOString() };

  if (!messages[sender]) messages[sender] = [];
  if (!messages[recipient]) messages[recipient] = [];

  messages[sender].push(newMessage);
  messages[recipient].push(newMessage);

  if (recipientSocketId) {
    io.to(recipientSocketId).emit("receive-message", newMessage);
  }
});

  

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    for (const email in onlineUsers) {
      if (onlineUsers[email] === socket.id) {
        delete onlineUsers[email];
        break;
      }
    }
  });
});
// جلب جميع المستخدمين (باستثناء المستخدم الذي قام بالطلب)
// جلب جميع المستخدمين باستثناء المستخدم الحالي
app.get("/users", (req, res) => {
  console.log("📌 جلب جميع المستخدمين");
  
  if (users.length === 0) {
    return res.status(404).json({ message: "No users found" });
  }

  res.status(200).json(users);
});


const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
