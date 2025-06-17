import 'dotenv/config';
import OpenAI from "openai";
import { createAssistant } from '../dist/openai/createAssistant.js';
import { createThread } from '../dist/openai/createThread.js';
import { createRun } from '../dist/openai/createRun.js';
import { performRun } from '../dist/openai/performRun.js';

const client = new OpenAI();

// Store assistant and thread instances (in production, you'd want proper session management)
let assistant = null;
let thread = null;

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

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        // Health check endpoint
        res.json({ status: 'OK' });
        return;
    }

    if (req.method === 'POST') {
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
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
} 