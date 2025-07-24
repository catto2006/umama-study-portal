// Create chat container HTML structure
document.getElementById('helpdesk-container').innerHTML = `
<section id="login-section">
  <p>Enter access code:</p>
  <input type="password" id="access-code" placeholder="Code..." />
  <button id="login-btn">Login</button>
  <div id="login-error">Invalid code, try again.</div>
</section>
<section id="chat-section" style="display:none;">
  <button id="emergency-btn">Emergency Surge</button>
  <div id="online-users">Online Users: 0</div>
  <div id="messages"></div>
  <form id="chat-form">
    <button type="button" id="emoji-btn">😊</button>
    <input type="text" id="message-input" placeholder="Type a message..." />
    <button type="submit" id="send-btn" disabled>Send</button>
    <div id="emoji-picker"></div>
  </form>
</section>
`;

// Firebase setup
const firebaseConfig = {
  apiKey: "AIzaSyAjhr9440jqm7xk4TISB9LXlU7UMfJ-aYY",
  authDomain: "umama-study-portal.firebaseapp.com",
  databaseURL: "https://umama-study-portal-default-rtdb.firebaseio.com/",
  projectId: "umama-study-portal",
  storageBucket: "umama-study-portal.appspot.com",
  messagingSenderId: "438854993441",
  appId: "1:438854993441:web:bbe2003382a6bfefbcc560"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// DOM references
const loginSection = document.getElementById("login-section");
const chatSection  = document.getElementById("chat-section");
const accessCode   = document.getElementById("access-code");
const loginBtn     = document.getElementById("login-btn");
const loginError   = document.getElementById("login-error");
const onlineUsers  = document.getElementById("online-users");
const messagesDiv  = document.getElementById("messages");
const chatForm     = document.getElementById("chat-form");
const inputField   = document.getElementById("message-input");
const sendBtn      = document.getElementById("send-btn");
const emojiBtn     = document.getElementById("emoji-btn");
const emojiPicker  = document.getElementById("emoji-picker");
const emergencyBtn = document.getElementById("emergency-btn");

let currentUser = null, userRef = null;

// Access codes mapping
const codes = {
  "ayan123": "Babygurl",
  "umama123": "KuchuPrincess"
};

// Emoji picker setup
const emojis = ["😀","😂","😍","😎","👍","🎉","🔥","😢","🤔","🙌"];
emojis.forEach(e => {
  const span = document.createElement("span");
  span.textContent = e;
  span.addEventListener("click", () => {
    inputField.value += e;
    sendBtn.disabled = !inputField.value.trim();
    emojiPicker.style.display = "none";
  });
  emojiPicker.appendChild(span);
});

emojiBtn.addEventListener("click", () => {
  emojiPicker.style.display = emojiPicker.style.display === "flex" ? "none" : "flex";
});
document.addEventListener("click", e => {
  if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
    emojiPicker.style.display = "none";
  }
});

// Enable send button only when input has text
inputField.addEventListener("input", () => {
  sendBtn.disabled = !inputField.value.trim();
});

// Format timestamp HH:MM AM/PM
function formatTime(ts) {
  const d = new Date(ts);
  let h = d.getHours(), m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  m = m.toString().padStart(2, "0");
  return `${h}:${m} ${ampm}`;
}

// Display a chat message
function addMessage({ sender, text, timestamp }) {
  const wrapper = document.createElement("div");
  wrapper.className = `message-wrapper ${sender}`;
  wrapper.innerHTML = `
    <div class="username">${sender}</div>
    <div class="bubble">${text}</div>
    <div class="timestamp">${formatTime(timestamp)}</div>
  `;
  messagesDiv.appendChild(wrapper);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Handle welcome message
function showWelcome() {
  messagesDiv.innerHTML = "";
  const el = document.createElement("div");
  el.className = "welcome";
  el.innerText = `Welcome, ${currentUser}!`;
  messagesDiv.appendChild(el);
}

// Firebase presence tracking
function setupPresence() {
  const ref = db.ref("onlineUsers");
  const keyed = ref.push();
  userRef = keyed;
  userRef.set(currentUser);
  userRef.onDisconnect().remove();

  ref.on("value", snap => {
    const count = snap.numChildren();
    onlineUsers.innerText = `Online Users: ${count}`;
  });
}

// Load historic chat and subscribe to new
function loadChat() {
  messagesDiv.innerHTML = "";
  showWelcome();

  db.ref("messages").off();
  db.ref("messages").orderByChild("timestamp").limitToLast(50)
    .on("child_added", snap => {
      addMessage(snap.val());
    });
}

// Authentication/login
loginBtn.addEventListener("click", () => {
  const code = accessCode.value.trim();
  if (codes[code]) {
    currentUser = codes[code];
    loginError.style.display = "none";
    loginSection.style.display = "none";
    chatSection.style.display = "block";
    accessCode.value = "";
    messagesDiv.innerHTML = "";
    showWelcome();
    db.ref("messages").off();
    loadChat();
    setupPresence();
  } else {
    loginError.style.display = "block";
  }
});

// Send message
chatForm.addEventListener("submit", e => {
  e.preventDefault();
  const text = inputField.value.trim();
  if (!text) return;
  db.ref("messages").push({
    sender: currentUser,
    text,
    timestamp: Date.now()
  });
  inputField.value = "";
  sendBtn.disabled = true;
});

// Emergency Surge button behaviour
emergencyBtn.addEventListener("click", () => {
  userRef && userRef.remove();
  chatSection.style.display = "none";
  loginSection.style.display = "block";
  messagesDiv.innerHTML = "";
  onlineUsers.innerText = "Online Users: 0";
});
