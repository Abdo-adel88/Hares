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
const users = []; // لتخزين المستخدمين المسجلين
const messages = []; // لتخزين الرسائل
const onlineUsers = {}; // لتخزين المستخدمين المتصلين

// تسجيل مستخدم جديد
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  if (users.find((user) => user.email === email)) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { id: users.length + 1, email, password: hashedPassword };
  users.push(newUser);
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
  res.status(200).json({ message: "Login successful", token });
});

// جلب جميع المستخدمين
app.get("/users", (req, res) => {
  res.status(200).json(users.map((user) => ({ id: user.id, email: user.email })));
});

// جلب الرسائل بين مستخدمين معينين
app.get("/messages/:email", (req, res) => {
  const email = req.params.email;
  const userMessages = messages.filter((msg) => msg.recipient === email || msg.sender === email);
  res.status(200).json(userMessages);
});
app.post("/delete-message", (req, res) => {
    const { sender, recipient, message } = req.body;
    const messageIndex = messages.findIndex(
      (msg) => msg.sender === sender && msg.recipient === recipient && msg.message === message
    );
  
    if (messageIndex !== -1) {
      messages.splice(messageIndex, 1);
      res.status(200).json({ message: "Message deleted successfully" });
    } else {
      res.status(404).json({ message: "Message not found" });
    }
});

// Socket.IO
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // تسجيل المستخدم عند الاتصال
  socket.on("register-user", (email) => {
    onlineUsers[email] = socket.id;
    console.log(`User ${email} is online`);
  });

  // استقبال وإرسال الرسائل
  socket.on("send-message", (data) => {
    const { sender, recipient, message } = data;
    const recipientSocketId = onlineUsers[recipient];

    const newMessage = { sender, recipient, message, timestamp: new Date().toISOString() };
    messages.push(newMessage);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit("receive-message", newMessage);
    }
  });

  // عند قطع الاتصال
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
// استقبال وإرسال الرسائل

  


  
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});