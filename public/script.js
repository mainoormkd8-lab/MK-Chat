alert("Script Loaded");

const socket = io();

let myName = "";
let selectedUser = "";

const loginPage = document.getElementById("loginPage");
const chatPage = document.getElementById("chatPage");
const username = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");

const chatBox = document.getElementById("chatBox");
const message = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const onlineUsers = document.getElementById("onlineUsers");
const usersList = document.getElementById("users");
const typing = document.getElementById("typing");

const emojiBtn = document.getElementById("emojiBtn");
const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");

loginBtn.onclick = () => {
  if (username.value.trim() === "") {
    alert("Apna naam likho");
    return;
  }

  myName = username.value.trim();

  socket.emit("join", myName);

  loginPage.style.display = "none";
  chatPage.style.display = "flex";
};

function sendMessage() {
  const text = message.value.trim();

  if (!text) return;

  socket.emit("chat message", {
    name: myName,
    text,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  message.value = "";
}

sendBtn.onclick = sendMessage;

message.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});

emojiBtn.onclick = () => {
  message.value += "😊";
};

imageBtn.onclick = () => imageInput.click();

imageInput.onchange = () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    socket.emit("chat image", {
      name: myName,
      image: reader.result,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })
    });
  };

  reader.readAsDataURL(file);
};

socket.on("chat message", (data) => {
  const div = document.createElement("div");
  div.className = "message";

  div.innerHTML = `
    <b>${data.name}</b><br>
    ${data.text}
    <div>${data.time}</div>
  `;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("chat image", (data) => {
  const div = document.createElement("div");
  div.className = "message";

  div.innerHTML = `
    <b>${data.name}</b><br>
    <img src="${data.image}" style="max-width:220px;border-radius:10px;">
    <div>${data.time}</div>
  `;

  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
});

socket.on("online users", (count) => {
  onlineUsers.innerText = `🟢 ${count} User Online`;
});

socket.on("user list", (users) => {
  usersList.innerHTML = "";

  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = "🟢 " + user.name;
    usersList.appendChild(li);
  });
});

socket.on("typing", (name) => {
  if (name === myName) return;

  typing.innerText = name + " is typing...";

  setTimeout(() => {
    typing.innerText = "";
  }, 1000);
});
