// AO Docs to JSON Converter
// This script fetches and transforms AO blockchain documentation into a structured JSON file

const fetch = require("node-fetch");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://cookbook_ao.g8way.io/welcome/index.html";
const OUTPUT_FILE = "aodocs.json";

// Structure to store documentation
const docsStructure = {
  title: "AO Blockchain Documentation",
  baseUrl: BASE_URL,
  lastUpdated: new Date().toISOString(),
  sections: [],
};

// Function to fetch a page
async function fetchPage(url) {
  try {
    const response = await fetch(url);
    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return null;
  }
}

// Function to extract content from a page
function extractContent(html, url) {
  const $ = cheerio.load(html);

  const pageData = {
    title: $("h1").first().text().trim(),
    url: url,
    content: [],
    subsections: [],
  };

  // Extract main content
  const mainContent = $(".content");

  // Process paragraphs, code blocks, lists, etc.
  mainContent.children().each((i, el) => {
    const element = $(el);

    // Skip navigation elements
    if (element.hasClass("navigation") || element.hasClass("sidebar")) {
      return;
    }

    if (element.is("h2, h3, h4, h5, h6")) {
      // Process headings as subsections
      const heading = {
        level: parseInt(element.prop("tagName").substring(1)),
        title: element.text().trim(),
        content: [],
      };
      pageData.subsections.push(heading);
    } else if (element.is("pre")) {
      // Code blocks
      const codeBlock = {
        type: "code",
        language:
          element.find("code").attr("class")?.replace("language-", "") ||
          "plaintext",
        text: element.text().trim(),
      };

      if (pageData.subsections.length > 0) {
        pageData.subsections[pageData.subsections.length - 1].content.push(
          codeBlock
        );
      } else {
        pageData.content.push(codeBlock);
      }
    } else if (element.is("p")) {
      // Regular paragraphs
      const paragraph = {
        type: "paragraph",
        text: element.text().trim(),
      };

      if (pageData.subsections.length > 0) {
        pageData.subsections[pageData.subsections.length - 1].content.push(
          paragraph
        );
      } else {
        pageData.content.push(paragraph);
      }
    } else if (element.is("ul, ol")) {
      // Lists
      const listItems = [];
      element.find("li").each((i, li) => {
        listItems.push($(li).text().trim());
      });

      const list = {
        type: element.is("ul") ? "unordered-list" : "ordered-list",
        items: listItems,
      };

      if (pageData.subsections.length > 0) {
        pageData.subsections[pageData.subsections.length - 1].content.push(
          list
        );
      } else {
        pageData.content.push(list);
      }
    }
  });

  return pageData;
}

// Function to discover and process all pages
async function processDocs() {
  // Start with the main page
  console.log(`Fetching main page from ${BASE_URL}...`);
  const mainPageHtml = await fetchPage(BASE_URL);

  if (!mainPageHtml) {
    console.error("Failed to fetch main page. Exiting.");
    return;
  }

  // Extract main page content
  const mainPageData = extractContent(mainPageHtml, BASE_URL);
  docsStructure.sections.push(mainPageData);

  // Find and process all links from the main page
  const $ = cheerio.load(mainPageHtml);
  const links = [];

  // Extract links from navigation and content
  $("a").each((i, el) => {
    const href = $(el).attr("href");

    if (
      href &&
      !href.startsWith("http") &&
      !href.startsWith("#") &&
      !links.includes(href)
    ) {
      links.push(href);
    }
  });

  // Process each found link
  for (const link of links) {
    const fullUrl = new URL(link, BASE_URL).toString();
    console.log(`Processing ${fullUrl}...`);

    const pageHtml = await fetchPage(fullUrl);
    if (pageHtml) {
      const pageData = extractContent(pageHtml, fullUrl);
      docsStructure.sections.push(pageData);

      // Small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  // Save the final JSON result
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(docsStructure, null, 2), "utf8");

  console.log(`Documentation successfully saved to ${OUTPUT_FILE}`);
  console.log(`Total sections processed: ${docsStructure.sections.length}`);
}

// Main execution
console.log("Starting AO documentation scraper...");
processDocs()
  .then(() => console.log("Processing complete!"))
  .catch((error) => console.error("Error during processing:", error));
