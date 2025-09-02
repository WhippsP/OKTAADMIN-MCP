// server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as dotenv from "dotenv";
import path from "path";

import { createOktaClient } from './client/client-factory.js';
import { registerTools } from './tools/tool-registry.js';

const projectRoot = path.resolve(import.meta.dirname, '..');
const envPath = path.join(projectRoot, '.env');
dotenv.config({ path: envPath });

// Create MCP server
const server = new McpServer({
  name: "OKTA Admin MCP Server",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {},
  },
});

// Initialize Okta client (real or mock based on environment)
const client = createOktaClient();

// Register all tools
registerTools(server, client);

// Server startup
async function startServer() {
  try {
    console.error(`Starting Okta Admin MCP Server in ${process.env.NODE_ENV === "test" ? "Test" : "Production"} mode.`);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error(`Okta Admin MCP Server connected via Stdio.`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();