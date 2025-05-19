// // AO Docs from GitHub to JSON
// const axios = require("axios");
// const fs = require("fs");

// // Configuration
// const REPO_OWNER = "permaweb"; // Replace with actual owner
// const REPO_NAME = "ao"; // Replace with actual repo name
// const OUTPUT_FILE = "ao_docs.json";

// // GitHub API base URL
// const GITHUB_API = "https://api.github.com";

// // Documentation structure
// const docsStructure = {
//   title: "AO Blockchain Documentation",
//   source: `https://github.com/permaweb/ao-cookbook`,
//   lastUpdated: new Date().toISOString(),
//   sections: [],
// };

// // Optional GitHub token for higher rate limits
// const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

// // Headers for GitHub API requests
// const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};

// // Function to get file contents from GitHub
// async function getFileContent(path) {
//   try {
//     const response = await axios.get(
//       `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
//       { headers }
//     );

//     if (response.data.type === "file") {
//       // For a single file
//       const content = Buffer.from(response.data.content, "base64").toString(
//         "utf8"
//       );
//       return {
//         name: response.data.name,
//         path: response.data.path,
//         content,
//       };
//     }

//     return null;
//   } catch (error) {
//     console.error(`Error fetching ${path}:`, error.message);
//     return null;
//   }
// }

// // Function to list directory contents
// async function listDirectoryContents(path = "") {
//   try {
//     const response = await axios.get(
//       `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`,
//       { headers }
//     );

//     // If response is an array, it's a directory listing
//     if (Array.isArray(response.data)) {
//       return response.data.map((item) => ({
//         name: item.name,
//         path: item.path,
//         type: item.type,
//       }));
//     }

//     return [];
//   } catch (error) {
//     console.error(`Error listing ${path}:`, error.message);
//     return [];
//   }
// }

// // Function to process markdown file
// function processMarkdown(content, path) {
//   // Basic processing of markdown content
//   const lines = content.split("\n");

//   // Extract title from the first heading
//   let title = path.split("/").pop().replace(".md", "");
//   const titleMatch = lines.find((line) => line.startsWith("# "));
//   if (titleMatch) {
//     title = titleMatch.replace(/^# /, "").trim();
//   }

//   // Process content
//   const processedContent = [];
//   let currentSection = null;

//   for (const line of lines) {
//     // Skip empty lines
//     if (!line.trim()) continue;

//     // Process headings
//     if (line.startsWith("#")) {
//       const level = line.match(/^#+/)[0].length;
//       const text = line.replace(/^#+\s+/, "").trim();

//       if (level === 1) {
//         // Skip the main title as we already extracted it
//         continue;
//       }

//       currentSection = {
//         type: "heading",
//         level,
//         text,
//         content: [],
//       };

//       processedContent.push(currentSection);
//       continue;
//     }

//     // Process code blocks
//     if (line.startsWith("```")) {
//       const match = line.match(/^```(\w*)/);
//       const language = match ? match[1] : "plaintext";

//       // Find the end of the code block
//       const startIndex = lines.indexOf(line);
//       const endIndex = lines
//         .slice(startIndex + 1)
//         .findIndex((l) => l.startsWith("```"));

//       if (endIndex !== -1) {
//         const codeContent = lines
//           .slice(startIndex + 1, startIndex + 1 + endIndex)
//           .join("\n");

//         const codeBlock = {
//           type: "code",
//           language,
//           text: codeContent,
//         };

//         if (currentSection) {
//           currentSection.content.push(codeBlock);
//         } else {
//           processedContent.push(codeBlock);
//         }

//         // Skip to the end of the code block
//         lines.splice(startIndex, endIndex + 2);
//         continue;
//       }
//     }

//     // Process regular text
//     if (line.trim()) {
//       const paragraph = {
//         type: "paragraph",
//         text: line.trim(),
//       };

//       if (currentSection) {
//         currentSection.content.push(paragraph);
//       } else {
//         processedContent.push(paragraph);
//       }
//     }
//   }

//   return {
//     title,
//     path,
//     content: processedContent,
//   };
// }

// // Main function to recursively process directories
// async function processDirectory(path = "") {
//   console.log(`Processing directory: ${path || "root"}`);

//   const items = await listDirectoryContents(path);

//   for (const item of items) {
//     // Skip non-documentation files
//     if (
//       item.name.startsWith(".") ||
//       ["LICENSE", "README.md", "CONTRIBUTING.md"].includes(item.name)
//     ) {
//       continue;
//     }

//     if (item.type === "dir") {
//       // Recursively process directories
//       await processDirectory(item.path);
//     } else if (item.name.endsWith(".md")) {
//       // Process markdown files
//       console.log(`Processing file: ${item.path}`);
//       const fileData = await getFileContent(item.path);

//       if (fileData) {
//         const processedData = processMarkdown(fileData.content, item.path);

//         docsStructure.sections.push({
//           title: processedData.title,
//           path: item.path,
//           url: `https://github.com/${REPO_OWNER}/${REPO_NAME}/blob/main/${item.path}`,
//           content: processedData.content,
//         });
//       }

//       // Respect GitHub's rate limits
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }
//   }
// }

// // Main function
// async function main() {
//   console.log(
//     `Starting to process AO documentation from GitHub (${REPO_OWNER}/${REPO_NAME})...`
//   );

//   try {
//     // Look for documentation directories
//     const docDirs = [
//       "docs",
//       "documentation",
//       "doc",
//       "cookbook",
//       "guide",
//       "wiki",
//     ];

//     // Check if any of these directories exist
//     const rootContents = await listDirectoryContents();
//     const foundDocDir = rootContents.find(
//       (item) => item.type === "dir" && docDirs.includes(item.name.toLowerCase())
//     );

//     if (foundDocDir) {
//       await processDirectory(foundDocDir.path);
//     } else {
//       console.log(
//         "No standard documentation directory found. Processing all markdown files..."
//       );
//       await processDirectory();
//     }

//     // Write the documentation structure to a file
//     fs.writeFileSync(
//       OUTPUT_FILE,
//       JSON.stringify(docsStructure, null, 2),
//       "utf8"
//     );

//     console.log(`Documentation successfully saved to ${OUTPUT_FILE}`);
//     console.log(`Total sections processed: ${docsStructure.sections.length}`);
//   } catch (error) {
//     console.error("Error processing documentation:", error);
//   }
// }

// main();
