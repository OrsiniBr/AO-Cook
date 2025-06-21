import express from 'express';
import bodyParser from 'body-parser';
import handler from './server.js';

const app = express();
const port = 3001;

app.use(bodyParser.json());

// Wrap the handler to work with Express
app.all(['/chat', '/health'], async (req, res) => {
  // Express req/res are compatible with the handler signature
  await handler(req, res);
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
}); 