const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(bodyParser.json());
app.use(cors());

// مفتاح سري لتوقيع الـ JWT
const SECRET_KEY = "your_secret_key";

// بيانات المستخدمين (بدلاً من قاعدة بيانات، هنا مجرد محاكاة بسيطة)
const users = [];

// ======= Endpoints =======

// 1. تسجيل مستخدم جديد
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // التحقق إذا كان المستخدم موجودًا
    const userExists = users.find(user => user.username === username);
    if (userExists) {
        return res.status(400).json({ message: "User already exists" });
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: users.length + 1, username, password: hashedPassword };
    users.push(newUser);

    res.status(201).json({ message: "User registered successfully" });
});

// 2. تسجيل الدخول
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid credentials" });
    }

    // توليد الـ JWT
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

    res.status(200).json({ message: "Login successful", token });
});

// 3. Endpoint للحصول على بيانات المستخدم
app.get("/profile", (req, res) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(401).json({ message: "Token is required" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        const user = users.find(user => user.id === decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ id: user.id, username: user.username });
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
});

// ======= Socket.IO =======

// قائمة للعملاء المتصلين
const onlineUsers = {};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // استقبال طلب الاتصال مع معرف المستخدم
    socket.on("register-user", (userId) => {
        onlineUsers[userId] = socket.id;
        console.log(`User ${userId} is online`);
    });

    // استقبال الرسائل
    socket.on("send-message", (data) => {
        const { recipientId, message } = data;
        const recipientSocketId = onlineUsers[recipientId];

        if (recipientSocketId) {
            io.to(recipientSocketId).emit("receive-message", {
                message,
                senderId: data.senderId,
            });
        }
    });

    // عند قطع الاتصال
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

// ======= تشغيل السيرفر =======
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
