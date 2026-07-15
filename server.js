const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

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

const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Running on Port ${PORT}`);
});
