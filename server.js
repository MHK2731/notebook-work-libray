const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();
const root = path.join(__dirname);
const dataDir = path.join(root, 'data');
const usersFile = path.join(dataDir, 'users.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(usersFile)) {
  fs.writeFileSync(
    usersFile,
    JSON.stringify({
      users: [
        {
          id: 1,
          name: 'Student Example',
          email: 'student@example.com',
          password: 'Password123!'
        }
      ]
    }, null, 2)
  );
}

const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8')).users;

app.use(express.json());
app.use(
  session({
    secret: 'notebook-work-library-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

const findUser = (email) => users.find((user) => user.email.toLowerCase() === email.toLowerCase());

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = findUser(email);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  req.session.userId = user.id;
  res.json({
    success: true,
    user: {
      name: user.name,
      email: user.email
    }
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ error: 'Unable to log out. Please try again.' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

app.get('/api/me', (req, res) => {
  const user = users.find((userEntry) => userEntry.id === req.session.userId);
  if (!user) {
    return res.json({ authenticated: false });
  }
  res.json({
    authenticated: true,
    user: {
      name: user.name,
      email: user.email
    }
  });
});

app.use(express.static(root));

app.get(['/', '/login'], (req, res) => {
  res.sendFile(path.join(root, 'login.html'));
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Notebook Work Library server running on http://localhost:3000');
});
