import OpenAI from "openai";
import { Assistant } from "openai/resources/beta/assistants";
import { tools } from '../tools/allTools.js';
import { assistantPrompt } from "../const/prompt.js";
const fs = require("fs");


export async function createAssistant(client: OpenAI): Promise<Assistant> {

    const file = await client.files.create({
        file: fs.createReadStream("../aodocs.json"),
        purpose: "assistants",
    });
    console.log("File ID:", file.id);

    return await client.beta.assistants.create({
        model: "gpt-4o-mini",
        name: "AO Cook",
        instructions: assistantPrompt,
        file_ids: [file.id],
        tools: [{ type: "retrieval" || "code_interpreter"}]
    });
}

// import OpenAI from "openai";

// export async function createAssistant(client: OpenAI) {
//   // 1. Upload the cookbook file
//   const file = await client.files.create({
//     file: fs.createReadStream("./docs/cookbook.md"),
//     purpose: "assistants",
//   });

//   // 2. Create the Assistant with the file
//   const assistant = await client.beta.assistants.create({
//     name: "Blockchain Docs Expert",
//     instructions: "You are an AI assistant that explains blockchain documentation and cookbooks. Use the provided files to answer questions.",
//     model: "gpt-4-turbo-preview",
//     tools: [{ type: "retrieval" }], // Enable file retrieval
//     file_ids: [file.id], // Attach the cookbook
//   });

//   return assistant;
// }

// import OpenAI from "openai";
// import fs from "fs";

// export async function createAssistant(client: OpenAI) {
//   // 1. Upload the cookbook file
//   const file = await client.files.create({
//     file: fs.createReadStream("../aodocs.json"),
//     purpose: "assistants",
//   });

//   // 2. Create the Assistant with retrieval enabled
//   const assistant = await client.beta.assistants.create({
//     name: "Blockchain Docs Expert",
//     instructions: "You are an AI assistant that answers questions about the blockchain cookbook. Use the attached files to provide accurate explanations.",
//     model: "gpt-4-turbo-preview", // or "gpt-3.5-turbo"
//     tools: [{ type: "retrieval" }], // 🔥 Enable file retrieval here
//     file_ids: [file.id], // Attach the uploaded file
//   });

//   return assistant;
// }