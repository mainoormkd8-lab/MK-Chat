const User = require("./models/User");
const mongoose = require("mongoose");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log("MongoDB Connected");
})
.catch((err) => {
  console.log(err);
});
let onlineUsers = 0;
let users = [];

app.use(express.static("public"));

io.on("connection", (socket) => {

  onlineUsers++;
  io.emit("online users", onlineUsers);

  console.log("User Connected");

  socket.on("join", (name) => {

    socket.username = name;

    users.push({
      id: socket.id,
      name: name
    });

    io.emit("user list", users);

  });

  socket.on("typing", (name) => {
    socket.broadcast.emit("typing", name);
  });

  socket.on("chat message", (data) => {

    if (data.to) {
      io.to(data.to).emit("chat message", data);
      socket.emit("chat message", data);
    } else {
      io.emit("chat message", data);
    }

  });

  socket.on("chat image", (data) => {

    if (data.to) {
      io.to(data.to).emit("chat image", data);
      socket.emit("chat image", data);
    } else {
      io.emit("chat image", data);
    }

  });

  socket.on("disconnect", () => {

    onlineUsers--;

    users = users.filter(user => user.id !== socket.id);

    io.emit("user list", users);
    io.emit("online users", onlineUsers);

    console.log("User Disconnected");

  });

});
app.use(express.json());

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (user) {
      return res.json({
        success: false,
        message: "Username already exists"
      });
    }

    await User.create({
      username,
      password
    });

    res.json({
      success: true,
      message: "Account created"
    });

  } catch (err) {
    console.log(err);

    res.json({
      success: false,
      message: "Server error"
    });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid username or password"
      });
    }

    res.json({
      success: true,
      message: "Login successful",
      username: user.username
    });

  } catch (err) {
    console.log(err);

    res.json({
      success: false,
      message: "Server error"
    });
  }
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Running on Port ${PORT}`);
});
