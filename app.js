const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const cookieParser = require('cookie-parser'); // Import the cookie-parser middleware

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser()); // Use cookie-parser middleware

// Serve the Contact Us form page
app.get('/contactus', (req, res) => {
  res.render('contactus');
});

// Handle the form submission
app.post('/submitcontact', (req, res) => {
  // Retrieve form data
  const { name, email, phone, callTime } = req.body;

  // You can process the form data here, save it to a database, send emails, etc.

  // After processing, redirect to the success page
  res.redirect('/success');
});

// Show the success message
app.get('/success', (req, res) => {
  res.render('success');
});

// ... (your existing code)

// Serve the login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Handle login form submission
app.post('/login', (req, res) => {
  const { username } = req.body;

  // Store the username in a cookie (better than local storage for this purpose)
  res.cookie('username', username);

  res.redirect('/');
});

// Serve the chat application
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

// Handle sending messages
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

// Handle Socket.io connections
io.on('connection', (socket) => {
  // Listen for new messages from clients
  socket.on('new message', ({ username, message }) => {
    // Handle messages here if needed
  });
});

// Start the server
http.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
