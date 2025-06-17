import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from "openai";
import { createAssistant } from './openai/createAssistant.js';
import { createThread } from './openai/createThread.js';
import { createRun } from './openai/createRun.js';
import { performRun } from './openai/performRun.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

const client = new OpenAI();

// Store assistant and thread instances (in production, you'd want proper session management)
let assistant: any = null;
let thread: any = null;

// Initialize assistant and thread
async function initializeChat() {
    try {
        assistant = await createAssistant(client);
        thread = await createThread(client);
        console.log('Assistant and thread initialized');
    } catch (error) {
        console.error('Error initializing chat:', error);
    }
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../dist')));
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // Initialize if not already done
        if (!assistant || !thread) {
            await initializeChat();
        }

        // Add the user's message to the thread
        await client.beta.threads.messages.create(thread.id, {
            role: "user",
            content: message
        });

        // Create and perform the run
        const run = await createRun(client, thread, assistant.id);
        const result = await performRun(run, client, thread);

        if (result?.type === 'text') {
            res.json({ response: result.text.value });
        } else {
            res.json({ response: 'Sorry, I couldn\'t process your request.' });
        }
    } catch (error) {
        console.error('Error in chat endpoint:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK' });
});

// Serve React app for all other routes in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../dist/index.html'));
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    initializeChat();
}); 