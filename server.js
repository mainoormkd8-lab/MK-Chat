const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let users = [];
let onlineUsers = 0;

io.on("connection", (socket) => {

  onlineUsers++;
  io.emit("online users", onlineUsers);

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
    io.emit("chat message", data);
  });

  socket.on("chat image", (data) => {
    io.emit("chat image", data);
  });

  socket.on("disconnect", () => {

    onlineUsers--;

    users = users.filter(user => user.id !== socket.id);

    io.emit("online users", onlineUsers);
    io.emit("user list", users);

  });

});const PORT = process.env.PORT || 3000;

server.listen(PORT, "0.0.0.0", () => {
  console.log("Server Running on Port " + PORT);
});
