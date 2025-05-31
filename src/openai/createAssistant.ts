import OpenAI from "openai";
import { Assistant } from "openai/resources/beta/assistants";
import { tools } from "../tools/allTools.js";
import { assistantPrompt } from "../const/prompt.js";
import path from "path";
import fs from "fs";

export async function createAssistant(client: OpenAI): Promise<Assistant> {
  // Resolve the absolute path to aodocs.json
  const docsPath = path.join(process.cwd(), "aodocs.json");

  // Upload the file
  const file = await client.files.create({
    file: fs.createReadStream(docsPath),
    purpose: "assistants",
  });
  console.log("File ID:", file.id);

  // Create assistant with file
  return await client.beta.assistants.create({
    name: "AO Cook",
    instructions: assistantPrompt,
    model: "gpt-4o-mini",

    tools: Object.values(tools).map((tool) => tool.definition),
  } as any); // Type assertion needed until OpenAI types are updated
}
