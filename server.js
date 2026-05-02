const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const root = path.join(__dirname);
const dataDir = path.join(root, 'data');
const uploadDir = path.join(root, 'uploads');
const usersFile = path.join(dataDir, 'users.json');
const notebookWorkFile = path.join(dataDir, 'notebook-works.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
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

if (!fs.existsSync(notebookWorkFile)) {
  fs.writeFileSync(notebookWorkFile, JSON.stringify([], null, 2));
}

const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8')).users;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

const upload = multer({
  dest: uploadDir,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf'];
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(file.mimetype) || extension === '.pdf') {
      return cb(null, true);
    }
    cb(new Error('Only PDF files are allowed.'));
  }
});

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

app.post('/api/notebook-work', upload.single('pdfFile'), (req, res) => {
  const { name, email, class: studentClass, subject, title, filelink, description } = req.body;
  if (!name || !email || !subject || !title) {
    return res.status(400).json({ error: 'Please provide name, email, subject, and title.' });
  }

  if (!filelink && !req.file) {
    return res.status(400).json({ error: 'Please provide either a PDF file or a file link.' });
  }

  const currentWorks = JSON.parse(fs.readFileSync(notebookWorkFile, 'utf-8')) || [];
  const newWork = {
    id: Date.now(),
    name,
    email,
    class: studentClass || '',
    subject,
    title,
    filelink: filelink || null,
    description: description || null,
    uploadedAt: new Date().toISOString()
  };

  if (req.file) {
    newWork.pdf = {
      originalName: req.file.originalname,
      path: `/uploads/${req.file.filename}`,
      size: req.file.size,
      mimeType: req.file.mimetype
    };
  }

  currentWorks.push(newWork);
  fs.writeFileSync(notebookWorkFile, JSON.stringify(currentWorks, null, 2));

  res.json({ success: true, work: newWork });
});

app.get('/api/notebook-works', (req, res) => {
  const currentWorks = JSON.parse(fs.readFileSync(notebookWorkFile, 'utf-8')) || [];
  res.json({ works: currentWorks });
});

app.use('/uploads', express.static(uploadDir));
app.use(express.static(root));

app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({ error: err.message || 'Upload failed.' });
  }
  next();
});

app.get(['/', '/login'], (req, res) => {
  res.sendFile(path.join(root, 'login.html'));
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Notebook Work Library server running on http://localhost:3000');
});
