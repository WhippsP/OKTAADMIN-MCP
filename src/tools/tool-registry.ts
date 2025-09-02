// tool-registry.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import pkg from '@okta/okta-sdk-nodejs';

// Import tool management modules
import { createFactorManagement } from '../tools/FactorManagement.js';
import { createUserManagement } from '../tools/UserManagement.js';
import { createApplicationManagement } from '../tools/ApplicationManagement.js';
import { createGroupManagement } from '../tools/GroupManagement.js';
import { createSystemManagement } from '../tools/SystemManagement.js';
import { createPolicyManagement } from '../tools/PolicyManagement.js';
import { createZoneManagement } from '../tools/ZoneManagement.js';

const { Client } = pkg;

// Helper function to register multiple tools at once
function registerToolsArray(server: McpServer, tools: any[]) {
  tools.forEach(tool => {
    server.tool(
      tool.name,
      tool.description,
      tool.inputSchema?.shape ?? {},
      tool.execute
    );
  });
}

export function registerTools(server: McpServer, client: InstanceType<typeof Client>) {
  // User Management Tools
  registerUserManagementTools(server, client);
  
  // Application Management Tools
  registerApplicationTools(server, client);
  
  // Group Management Tools
  registerGroupTools(server, client);
  
  // System and Logging Tools
  registerSystemTools(server, client);
  
  // Factor/MFA Management Tools
  registerFactorTools(server, client);
  
  // Policy Management Tools
  registerPolicyTools(server, client);
  
  // Zone Management Tools
  registerZoneTools(server, client);
}

function registerUserManagementTools(server: McpServer, client: InstanceType<typeof Client>) {
  const userManagement = createUserManagement(client);
  
  const userTools = [
    userManagement.createUser,
    userManagement.deleteuser,
    userManagement.disableuser,
    userManagement.enableuser,
    userManagement.getUser,
    userManagement.listUsers,
    userManagement.updateuser,
    userManagement.resetpassword
  ];

  registerToolsArray(server, userTools);
}

function registerApplicationTools(server: McpServer, client: InstanceType<typeof Client>) {
  const applicationManagement = createApplicationManagement(client);
  
  const applicationTools = [
    applicationManagement.getUserApps,
    applicationManagement.listApplications,
    applicationManagement.getApplication,
    applicationManagement.assignUserToApp
  ];

  registerToolsArray(server, applicationTools);

  
}

function registerGroupTools(server: McpServer, client: InstanceType<typeof Client>) {
  const groupManagement = createGroupManagement(client);
  
  const groupTools = [
    groupManagement.listGroups,
    groupManagement.getGroup,
    groupManagement.createGroup,
    groupManagement.addUserToGroup,
    groupManagement.removeUserFromGroup,
    groupManagement.listGroupUsers
  ];

  registerToolsArray(server, groupTools);
}

function registerSystemTools(server: McpServer, client: InstanceType<typeof Client>) {
  const systemManagement = createSystemManagement(client);
  
  const systemTools = [
    systemManagement.listSystemLogs
  ];

  registerToolsArray(server, systemTools);
}

function registerFactorTools(server: McpServer, client: InstanceType<typeof Client>) {
  const factorManagement = createFactorManagement(client);
  
  server.tool(
    factorManagement.listUserFactors.name,
    factorManagement.listUserFactors.description,
    factorManagement.listUserFactors.inputSchema?.shape ?? {},
    factorManagement.listUserFactors.execute
  );
}

function registerPolicyTools(server: McpServer, client: InstanceType<typeof Client>) {
  const policyManagement = createPolicyManagement(client);
  
  const policyTools = [
    policyManagement.listPolicies
  ];

  registerToolsArray(server, policyTools);
}

function registerZoneTools(server: McpServer, client: InstanceType<typeof Client>) {
  const zoneManagement = createZoneManagement(client);
  
  const zoneTools = [
    zoneManagement.listZones
  ];

  registerToolsArray(server, zoneTools);
}