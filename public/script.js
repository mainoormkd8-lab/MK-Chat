alert("Script Loaded");
const socket = io();
let selectedUser = "";
let myName = "";

const loginPage = document.getElementById("loginPage");
const chatPage = document.getElementById("chatPage");
const username = document.getElementById("username");
;
const loginBtn = document.getElementById("loginBtn");
const usersList = document.getElementById("users");
const chatTitle = document.getElementById("chatTitle")
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

const chatBox = document.getElementById("chatBox");
const message = document.getElementById("message");
const typing = document.getElementById("typing");
const sendBtn = document.getElementById("sendBtn");
const emojiBtn = document.getElementById("emojiBtn");

const onlineUsers = document.getElementById("onlineUsers");
function sendMessage() {
  const text = message.value.trim();

  if (text === "") return;

  socket.emit("chat message", {
  from: myName,
  to: selectedUser ? selectedUser.id : null,
  text: text,
  time: new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })
});

  message.value = "";
}

sendBtn.addEventListener("click", sendMessage);
imageBtn.addEventListener("click", () => {
  imageInput.click();
});imageInput.addEventListener("change", () => {

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

});
emojiBtn.addEventListener("click", () => {

  message.value += "😊";

  message.focus();

});
message.addEventListener("input", () => {
  socket.emit("typing", myName);
});
message.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});socket.on("chat message", (data) => {

  const msg = document.createElement("div");

  msg.classList.add("message");

  if (data.name === myName) {
    msg.classList.add("me");
  } else {
    msg.classList.add("other");
  }

  msg.innerHTML = `
    <strong>${data.name}</strong><br>
    ${data.text}
    <div style="font-size:11px;margin-top:4px;text-align:right;">
      ${data.time}
    </div>
  `;

  chatBox.appendChild(msg);

  chatBox.scrollTop = chatBox.scrollHeight;

});
socket.on("online users", (count) => {
  if (count === 1) {
    onlineUsers.innerText = "🟢 1 User Online";
  } else {
    onlineUsers.innerText = `🟢 ${count} Users Online`;
  }
});
socket.on("user list", (users) => {

  usersList.innerHTML = "";

  users.forEach((user) => {

  const li = document.createElement("li");

  li.innerText = "🟢 " + user.name;

  li.onclick = () => {
    selectedUser = user;
    alert("Selected: " + user.name);
  };

  usersList.appendChild(li);

});
});
socket.on("typing", (name) => {

  if (name === myName) return;

  typing.innerText = name + " is typing...";

  clearTimeout(window.typingTimeout);

  window.typingTimeout = setTimeout(() => {
    typing.innerText = "";
  }, 1000);

});
socket.on("chat image", (data) => {

  const msg = document.createElement("div");

  msg.classList.add("message");

  if (data.name === myName) {
    msg.classList.add("me");
  } else {
    msg.classList.add("other");
  }

  msg.innerHTML = `
    <strong>${data.name}</strong><br>
    <img src="${data.image}" style="max-width:220px;border-radius:10px;">
    <div style="font-size:11px;text-align:right;">
      ${data.time}
    </div>
  `;

  chatBox.appendChild(msg);

  chatBox.scrollTop = chatBox.scrollHeight;

});
