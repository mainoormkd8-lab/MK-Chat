const socket = io();
let myName = "";

const loginPage = document.getElementById("loginPage");
const chatPage = document.getElementById("chatPage");
const username = document.getElementById("username");
const loginBtn = document.getElementById("loginBtn");

loginBtn.onclick = () => {
  if (username.value.trim() === "") {
    alert("Apna naam likho");
    return;
  }

  myName = username.value.trim();

  loginPage.style.display = "none";
  chatPage.style.display = "flex";
};

const chatBox = document.getElementById("chatBox");
const message = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");

function sendMessage() {
  const text = message.value.trim();

  if (text === "") return;

  socket.emit("chat message", {
    name: myName,
    text: text,
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  });

  message.value = "";
}

sendBtn.addEventListener("click", sendMessage);

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
