const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const cookieParser = require('cookie-parser'); // Import the cookie-parser middleware

// Use cookie-parser middleware
app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username } = req.body;

  // Store the username in a cookie (better than local storage for this purpose)
  res.cookie('username', username);

  res.redirect('/');
});

app.get('/', (req, res) => {
  const username = req.cookies.username; // Read the username from the cookie

  // Read messages from a file (simplified, you should use a database for this)
  fs.readFile('messages.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.render('index', { username, messages: [] });
    } else {
      const messages = JSON.parse(data);
      res.render('index', { username, messages });
    }
  });
});

// Rest of your code...

app.post('/send', (req, res) => {
  const username = req.cookies.username;
  const message = req.body.message;

  // Read existing messages, add the new message, and write them back to the file
  fs.readFile('messages.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      const messages = JSON.parse(data);
      messages.push({ username, message });

      fs.writeFile('messages.json', JSON.stringify(messages), (err) => {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        } else {
          // Notify all connected clients about the new message
          io.emit('new message', { username, message });
          res.sendStatus(200);
        }
      });
    }
  });
});

io.on('connection', (socket) => {
  // Listen for new messages from clients
  socket.on('new message', ({ username, message }) => {
    // Handle messages here if needed
  });
});

http.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
