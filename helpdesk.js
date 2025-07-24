// Firebase config and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAjhr9440jqm7xk4TISB9LXlU7UMfJ-aYY",
  authDomain: "umama-study-portal.firebaseapp.com",
  projectId: "umama-study-portal",
  storageBucket: "umama-study-portal.firebasestorage.app",
  messagingSenderId: "438854993441",
  appId: "1:438854993441:web:bbe2003382a6bfefbcc560",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const loginSection = document.getElementById('login-section');
const chatSection = document.getElementById('chat-section');
const loginBtn = document.getElementById('login-btn');
const accessCodeInput = document.getElementById('access-code');
const loginError = document.getElementById('login-error');
const chatWindow = document.getElementById('chat-window');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');

let currentUser = null;

const usersMap = {
  'ayan123': { username: 'Babygurl', color: 'linear-gradient(90deg, #1E3C72, #2A5298)' },
  'umama123': { username: 'Kuchu Princess', color: 'linear-gradient(90deg, #ff9966, #ff5e62)' },
};

loginBtn.onclick = () => {
  const code = accessCodeInput.value.trim();
  if (!usersMap[code]) {
    loginError.textContent = 'Invalid code. Please try again.';
    return;
  }
  currentUser = usersMap[code];
  loginSection.classList.add('hidden');
  chatSection.classList.remove('hidden');
  loginError.textContent = '';

  loadMessages();
};

chatForm.onsubmit = async (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  try {
    await db.collection('helpdeskMessages').add({
      username: currentUser.username,
      message: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
    messageInput.value = '';
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

function loadMessages() {
  db.collection('helpdeskMessages').orderBy('timestamp').onSnapshot(snapshot => {
    chatWindow.innerHTML = '';
    snapshot.forEach(doc => {
      const data = doc.data();
      if (!data.timestamp) return; // skip if no timestamp yet
      const msgDiv = document.createElement('div');
      msgDiv.classList.add('chat-message');

      // Style based on user
      let bgStyle = 'linear-gradient(90deg, #444, #666)';
      if (data.username === currentUser.username) {
        bgStyle = currentUser.color;
        msgDiv.classList.add('my-message');
      } else if (data.username === 'Babygurl') {
        bgStyle = usersMap['ayan123'].color;
      } else if (data.username === 'Kuchu Princess') {
        bgStyle = usersMap['umama123'].color;
      }

      msgDiv.style.background = bgStyle;
      msgDiv.innerHTML = `
        <strong>${data.username}</strong><br />
        <span>${escapeHtml(data.message)}</span><br />
        <small>${new Date(data.timestamp.toDate()).toLocaleString()}</small>
      `;
      chatWindow.appendChild(msgDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    });
  });
}

// Escape HTML to prevent injection
function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[m]);
}
