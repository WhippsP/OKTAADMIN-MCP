import { Client as mcpClient} from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { describe, expect, it, jest, beforeAll, afterAll } from '@jest/globals';

const debug = false;

const mclient = new mcpClient({
  name: "example-client",
  version: "1.0.0"
});

// PRE TEST SETUP
beforeAll(async () => {

  console.log = (...args: any[]) => {
    process.stdout.write(args.join(' ') + '\n');
  };

  const env = process.env.NODE_ENV || 'test';
  console.log(`Running tests in ${env} mode`);

  try {
      const transport = new StdioClientTransport({
        command: "/usr/local/bin/node",
        args: ["./dist/server.js"],
        env: {
          NODE_ENV: env
        }
      });
      
      await mclient.connect(transport);

      console.log("Connected successfully!");

    } catch (error) {
      console.error("Connection failed:", error);
    }
}, 30000);

// USER MANAGEMENT TESTS

describe('User Management Functions', () => {

  // ListUsers
  it('Should list all users', async () => {
    const result = await mclient.callTool({
      name: "list-user",
      arguments: {}
    });
    
    debug && console.log("Result:", JSON.stringify(result.content, null, 2));
    
    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();

    // Updated expectation to match the mocked data
    if (process.env.NODE_ENV === 'test') {
      expect(JSON.stringify(result.content)).toContain("Found 2 users:");
    }

    // In production mode, we can't guarantee the number of users
    // so we just check that some content is returned
    if (process.env.NODE_ENV === 'production') {
      expect(JSON.stringify(result.content)).toContain("Found");
      expect(JSON.stringify(result.content)).toContain("users:");
    }

  });

  // CreateUser
  const MCPCreatedUserId = `MCPTest${Date.now()}@example.com`
  it('Should create a new user', async () => {
    const result = await mclient.callTool({
      name: "create-user",
      arguments: { 
        email: MCPCreatedUserId,
        firstName: "MCPTest",
        lastName: "User"
      }
    });
    debug && console.log("Create Result:", JSON.stringify(result.content, null, 2));
    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();
    expect(JSON.stringify(result.content)).toContain("User created successfully");
  });

  // UpdateUser
  it('Should update an existing user', async () => {
    const result = await mclient.callTool({
      name: "update-user",
      arguments: { 
        userId: MCPCreatedUserId,
        firstName: "UpdatedFirstName",
        lastName: "UpdatedLastName"
      }
    });
    debug && console.log("Update Result:", JSON.stringify(result.content, null, 2));
    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();
    expect(JSON.stringify(result.content)).toContain("User updated successfully");
    expect(JSON.stringify(result.content)).toContain("UpdatedFirstName");
    expect(JSON.stringify(result.content)).toContain("UpdatedLastName");
  });

  // GetUser
  it('Should get a specific user', async () => {
    const result = await mclient.callTool({
      name: "get-user",
      arguments: { userId: MCPCreatedUserId }
    });
    debug && console.log("Get Result:", JSON.stringify(result.content, null, 2));
    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();
    expect(JSON.stringify(result.content)).toContain(MCPCreatedUserId);
  });

  it('Should throw error when getting a non-existent user', async () => {
    const result = await mclient.callTool({
      name: "get-user",
      arguments: { userId: "non-existent-id" }
    });
    debug && console.log("Failed Get Result:", JSON.stringify(result.content, null, 2));
    expect(result.isError).toBeTruthy();
    expect(JSON.stringify(result.content)).toContain("Error fetching user: OktaApiError: Okta HTTP 404 E0000007 Not found: Resource not found: non-existent-id (User)");
  });

  // ResetPaassword
  it('Should reset a user password', async () => {
    const result = await mclient.callTool({
      name: "reset-user-password",
      arguments: { userId: MCPCreatedUserId }
    });
    debug && console.log("Reset Result:", JSON.stringify(result.content, null, 2));
    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();
    expect(JSON.stringify(result.content)).toContain(`Password reset initiated for user ${MCPCreatedUserId}:`);
  });

  // DisableUser
  it('Should disable a user', async () => {
    const result = await mclient.callTool({
      name: "disable-user",
      arguments: { userId: MCPCreatedUserId }
    });
    debug && console.log("Disable Result:", JSON.stringify(result.content, null, 2));
    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();
    expect(JSON.stringify(result.content)).toContain(`User with ID ${MCPCreatedUserId} has been disabled.`);
  });

  // EnableUser
  it('Should enable a user', async () => {
    const result = await mclient.callTool({
      name: "enable-user",
      arguments: { userId: MCPCreatedUserId }
    });
    debug && console.log("Enable Result:", JSON.stringify(result.content, null, 2));
    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();
    expect(JSON.stringify(result.content)).toContain(`User with ID ${MCPCreatedUserId} has been enabled.`);
  });

  // DeleteUser
  it('Should delete a user', async () => {
    const result = await mclient.callTool({
      name: "delete-user",
      arguments: { userId: MCPCreatedUserId }
    });
    debug && console.log("Delete Result:", JSON.stringify(result.content, null, 2));
    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();
    expect(JSON.stringify(result.content)).toContain(`User with ID ${MCPCreatedUserId} has been permanently deleted.`);
  });
  
});


// Post Tests CLEANUP

afterAll(async () => {
  await mclient.close();
});