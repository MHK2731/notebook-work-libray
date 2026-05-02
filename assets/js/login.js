const loginForm = document.getElementById('loginForm');
const logoutButton = document.getElementById('logoutButton');
const studyPlannerButton = document.getElementById('studyPlannerButton');
const status = document.getElementById('status');
const userInfo = document.getElementById('userInfo');

function setMessage(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? '#ff6b6b' : '#4cd964';
}

function setSignedIn(user) {
  if (!user) {
    loginForm.style.display = 'block';
    logoutButton.style.display = 'none';
    studyPlannerButton.disabled = true;
    userInfo.textContent = '';
    setMessage('Please sign in using your email and password.', false);
    return;
  }

  loginForm.style.display = 'none';
  logoutButton.style.display = 'inline-block';
  studyPlannerButton.disabled = false;
  userInfo.innerHTML = `
    <strong>Name:</strong> ${user.name}<br />
    <strong>Email:</strong> ${user.email}
  `;
  setMessage(`Signed in as ${user.name} (${user.email})`, false);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    ...options
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Request failed.');
  }
  return body;
}

async function loadSession() {
  try {
    const data = await requestJson('/api/me', { method: 'GET' });
    setSignedIn(data.authenticated ? data.user : null);
  } catch (error) {
    setSignedIn(null);
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    setMessage('Enter both email and password.', true);
    return;
  }

  try {
    const data = await requestJson('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    setSignedIn(data.user);
  } catch (error) {
    setMessage(error.message || 'Login failed.', true);
  }
});

logoutButton.addEventListener('click', async () => {
  try {
    await requestJson('/api/logout', { method: 'POST' });
    setSignedIn(null);
  } catch (error) {
    setMessage(error.message || 'Logout failed.', true);
  }
});

studyPlannerButton.addEventListener('click', () => {
  window.location.href = 'study-planner.html';
});

loadSession();
