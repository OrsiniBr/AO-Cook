import OpenAI from "openai";
import { Assistant } from "openai/resources/beta/assistants";
import { tools } from '../tools/allTools.js';
import { assistantPrompt } from "../const/prompt.js";
import path from 'path';
import fs from "fs";

export async function createAssistant(client: OpenAI): Promise<Assistant> {
    // Resolve the absolute path to aodocs.json
    const docsPath = path.join(process.cwd(), 'aodocs.json');

    const file = await client.files.create({
        file: fs.createReadStream(docsPath),
        purpose: "assistants",
    });
    console.log("File ID:", file.id);

    return await client.beta.assistants.create({
        name: "AO Cook",
        instructions: assistantPrompt,
        model: "gpt-4-turbo-preview",
        tools: [
            { type: "code_interpreter" },
            { type: "retrieval" }
        ],
        file_ids: [file.id]
    } as any); // Type assertion needed due to OpenAI types not being up to date
}
