const express = require('express');
const path = require('path');
const EventEmitter = require('events');

const app = express();
const port = process.env.PORT || 3000;

// Event emitter for chat
const chatEmitter = new EventEmitter();

// Serve static files (chat.js)
app.use(express.static(__dirname + '/public'));

/**
 * Responds with plain text
 */
function respondText(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.end('hi');
}

/**
 * Responds with JSON
 */
function respondJson(req, res) {
  res.json({
    text: 'hi',
    numbers: [1, 2, 3],
  });
}

/**
 * Responds with echo data
 */
function respondEcho(req, res) {
  const { input = '' } = req.query;

  res.json({
    normal: input,
    shouty: input.toUpperCase(),
    charCount: input.length,
    backwards: input.split('').reverse().join(''),
  });
}

/**
 * 404 handler (optional, Express handles automatically too)
 */
function respondNotFound(req, res) {
  res.status(404).send('Not Found');
}

/**
 * Serve chat UI
 */
function chatApp(req, res) {
  res.sendFile(path.join(__dirname, '/chat.html'));
}

/**
 * Chat message endpoint
 */
function respondChat(req, res) {
  const { message } = req.query;

  chatEmitter.emit('message', message);
  res.end();
}

/**
 * Server Sent Events endpoint
 */
function respondSSE(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
  });

  const onMessage = (message) => {
    res.write(`data: ${message}\n\n`);
  };

  chatEmitter.on('message', onMessage);

  res.on('close', () => {
    chatEmitter.off('message', onMessage);
  });
}

// Routes
app.get('/', chatApp);           // chat UI
app.get('/json', respondJson);  // JSON route
app.get('/echo', respondEcho);  // echo route
app.get('/chat', respondChat);  // send message
app.get('/sse', respondSSE);    // receive messages

// Optional fallback
app.use(respondNotFound);

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
