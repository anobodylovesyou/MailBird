// server.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const axios = require('axios');
const path = require('path');

const app = express();
app.use(express.static('public'));

// Set up Telegram Bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secretLoveKey',
  resave: false,
  saveUninitialized: false
}));

// Serve static frontend files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Login route
app.post('/login', (req, res) => {
  const { password } = req.body;
  

  if (password === process.env.CORRECT_PASSWORD) {
    req.session.loggedIn = true;
    res.redirect('/grievance.html');
  } else {
    res.send('<script>alert("Wrong password 💔"); window.location.href="/index.html";</script>');
  }
});

// Auth middleware to protect routes
function isAuthenticated(req, res, next) {
  if (req.session.loggedIn) {
    return next();
  }
  res.send('<script>alert("Access denied 💌"); window.location.href="/index.html";</script>');
}

// Grievance form submission route (Protected)
// app.post('/submit', isAuthenticated, async (req, res) => {
//   const { title, description, mood } = req.body;
//   const message = `💌 New Grievance:\n\nTitle: ${title}\nMood: ${mood}\nDescription: ${description}`;

//   try {
//     await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
//       chat_id: TELEGRAM_CHAT_ID,
//       text: message,
//     });
//     res.redirect('/thankyou.html');
//   } catch (error) {
//     console.error('Telegram error:', error.message);
//     res.send('Error sending message.');
//   }
// });

app.post('/submit', async (req, res) => {
  if (!req.session.loggedIn) return res.status(403).send("Unauthorized");

  const { title, description, mood } = req.body;

  const message = `💌 New Grievance:\n\n📝 Title: ${title}\n❤️ Mood: ${mood}\n\n🧠 Description:\n${description}`;

  try {
    await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: process.env.TELEGRAM_CHAT_ID,
      text: message
    });

    // ✅ Set flag to allow access to thankyou page once
    req.session.canSeeThankYou = true;

    res.json({ success: true });
  } catch (error) {
    console.error("Telegram error:", error.message);
    res.status(500).json({ success: false });
  }
});



app.get('/check-auth', (req, res) => {
  if (req.session.loggedIn === true) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

app.get('/check-thankyou', (req, res) => {
  if (req.session.canSeeThankYou) {
    req.session.canSeeThankYou = false; // allow just once
    res.json({ allowed: true });
  } else {
    res.json({ allowed: false });
  }
});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
