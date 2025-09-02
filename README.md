# Okta Admin MCP Server

A Model Context Protocol (MCP) server that provides comprehensive Okta administration capabilities through a standardized interface. This server enables AI assistants and other MCP clients to perform user management, application management, group operations, and system administration tasks in Okta environments.

## Features

### User Management
- **List Users**: Retrieve all users in the Okta organization
- **Get User**: Fetch detailed information about a specific user
- **Create User**: Add new users to the organization
- **Update User**: Modify existing user profiles (name, email, phone)
- **Enable/Disable Users**: Activate or deactivate user accounts
- **Delete User**: Permanently remove users from the organization
- **Reset Password**: Generate password reset tokens for users

### Application Management
- **List Applications**: View all applications in the organization
- **Get Application**: Retrieve detailed application information
- **Get User Apps**: See applications assigned to a specific user
- **Assign User to App**: Grant application access to users

### Group Management
- **List Groups**: View all groups in the organization
- **Get Group**: Retrieve detailed group information
- **Create Group**: Add new groups
- **Add User to Group**: Assign users to groups
- **Remove User from Group**: Unassign users from groups
- **List Group Users**: See all users in a specific group

### Multi-Factor Authentication (MFA)
- **List User Factors**: View all MFA methods configured for a user

### Policy Management
- **List Policies**: View organizational policies (Sign-On, Password, MFA, etc.)

### System Administration
- **List System Logs**: Retrieve audit logs and system events
- **List Network Zones**: View configured network zones

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd okta-admin-mcp-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the project root:
```env
OKTA_ORG_URL=https://your-org.okta.com
OKTA_API_TOKEN=your-api-token
NODE_ENV=production
```

4. Build the project:
```bash
npm run build
```

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OKTA_ORG_URL` | Your Okta organization URL | Yes |
| `OKTA_API_TOKEN` | Okta API token with admin privileges | Yes |
| `NODE_ENV` | Environment mode (`production` or `test`) | No |

### Okta API Token Setup

1. Log in to your Okta Admin Console
2. Navigate to **Security** > **API**
3. Click **Tokens** tab
4. Click **Create Token**
5. Provide a name for the token
6. Copy the generated token (save it securely)

### Required Okta Permissions

The API token must have the following administrator roles:
- **Super Administrator** (recommended for full functionality)
- Or specific admin roles:
  - User Administrator
  - Application Administrator
  - Group Administrator
  - Read-only Administrator (for read operations)

## Usage

### Starting the Server

```bash
npm start
```

The server will start in stdio mode and connect via the Model Context Protocol.

### Development Mode

For development with mock data:

```bash
NODE_ENV=test npm start
```

This uses mock clients instead of making real API calls to Okta.

### MCP Client Integration

Configure your MCP client to connect to this server. Example configuration for various clients:

#### Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "okta-admin": {
      "command": "node",
      "args": ["path/to/okta-admin-mcp-server/dist/server.js"]
    }
  }
}
```

## API Tools Reference

### User Management Tools

#### `create-user`
Creates a new user in Okta.
- **Parameters**: `email`, `firstName`, `lastName`, `activate` (optional, default: true)

#### `get-user`
Retrieves a specific user by ID.
- **Parameters**: `userId`

#### `list-user`
Lists all users in the organization.
- **Parameters**: None

#### `update-user`
Updates an existing user's profile.
- **Parameters**: `userId`, `firstName` (optional), `lastName` (optional), `email` (optional), `mobilePhone` (optional)

#### `disable-user` / `enable-user`
Deactivates or activates a user account.
- **Parameters**: `userId`

#### `delete-user`
Permanently deletes a user.
- **Parameters**: `userId`, `sendEmail` (optional, default: false)

#### `reset-user-password`
Generates a password reset token for a user.
- **Parameters**: `userId`, `sendEmail` (optional, default: false)

### Application Management Tools

#### `list-applications`
Lists all applications in the organization.
- **Parameters**: `limit` (optional, default: 20)

#### `get-application`
Retrieves detailed information about a specific application.
- **Parameters**: `appId`

#### `get-user-apps`
Gets all applications assigned to a user.
- **Parameters**: `userId`

#### `assign-user-to-app`
Assigns a user to an application.
- **Parameters**: `appId`, `userId`

### Group Management Tools

#### `list-groups`
Lists all groups in the organization.
- **Parameters**: `limit` (optional, default: 20)

#### `get-group`
Retrieves detailed information about a specific group.
- **Parameters**: `groupId`

#### `create-group`
Creates a new group.
- **Parameters**: `name`, `description` (optional)

#### `add-user-to-group`
Adds a user to a group.
- **Parameters**: `groupId`, `userId`

#### `remove-user-from-group`
Removes a user from a group.
- **Parameters**: `groupId`, `userId`

#### `list-group-users`
Lists all users in a specific group.
- **Parameters**: `groupId`

### System Administration Tools

#### `list-system-logs`
Retrieves system audit logs.
- **Parameters**: `limit` (optional, default: 100), `since` (optional, ISO 8601 format)

#### `list-user-factors`
Lists all MFA factors configured for a user.
- **Parameters**: `userId`

#### `list-policies`
Lists organizational policies by type.
- **Parameters**: `type` (required, one of: OKTA_SIGN_ON, PASSWORD, MFA_ENROLL, IDP_DISCOVERY, ACCESS_POLICY, PROFILE_ENROLLMENT, POST_AUTH_SESSION, ENTITY_RISK)

#### `list-zones`
Lists all network zones.
- **Parameters**: None

## Architecture

### Project Structure

```
src/
├── server.ts              # Main MCP server entry point
├── client/
│   ├── client-factory.ts  # Factory for creating Okta clients
│   └── mock-client.ts     # Mock client for testing
└── tools/
    ├── tool-registry.ts   # Central tool registration
    ├── UserManagement.ts  # User-related operations
    ├── GroupManagement.ts # Group-related operations
    ├── ApplicationManagement.ts # App-related operations
    ├── FactorManagement.ts # MFA-related operations
    ├── PolicyManagement.ts # Policy-related operations
    ├── SystemManagement.ts # System/logging operations
    └── ZoneManagement.ts  # Network zone operations
```

### Key Components

- **Server**: Main MCP server that handles protocol communication
- **Client Factory**: Manages creation of real vs mock Okta clients
- **Tool Modules**: Organized by functional area, each providing specific operations
- **Tool Registry**: Central registration point for all available tools

## Error Handling

The server includes comprehensive error handling:

- **API Errors**: Okta API errors are caught and returned with descriptive messages
- **Validation Errors**: Input validation using Zod schemas
- **Network Errors**: Connection issues are handled gracefully
- **Authentication Errors**: Invalid tokens or permissions are clearly reported

## Testing

The project includes comprehensive Jest-based tests that can run against both mock data and real Okta instances.

### Available Test Commands

```bash
# Run tests against mock data (safe, no real API calls)
npm run test

# Run tests against production Okta instance (requires valid credentials)
npm run prdtest
```

### Test Configuration

Tests use the Model Context Protocol client to interact with the server, providing end-to-end testing of the MCP interface.

#### Mock Mode Testing (`npm run test`)

- Uses `NODE_ENV=test` environment
- No real API calls to Okta
- Predictable mock responses
- Safe for continuous integration

Mock mode provides:
- 2 sample users (`u1`, `u2`)
- 2 sample groups (`g1`, `g2`)  
- 2 sample applications (`app1`, `app2`)
- Sample system logs, policies, and network zones

#### Production Testing (`npm run prdtest`)

- Uses `NODE_ENV=production` environment
- Makes real API calls to your Okta instance
- Requires valid `OKTA_ORG_URL` and `OKTA_API_TOKEN`
- **Warning**: Creates/modifies/deletes real data in your Okta org

### Test Coverage

The test suite covers all user management operations:

- ✅ **List Users** - Retrieves all users in the organization
- ✅ **Create User** - Creates test users with timestamp-based emails
- ✅ **Update User** - Modifies user profiles (first name, last name)
- ✅ **Get User** - Retrieves specific user details
- ✅ **Reset Password** - Generates password reset tokens
- ✅ **Disable User** - Deactivates user accounts
- ✅ **Enable User** - Reactivates user accounts
- ✅ **Delete User** - Permanently removes users
- ✅ **Error Handling** - Tests invalid user ID scenarios

### Test Data Cleanup

Tests automatically clean up created data:
- Test users are created with unique timestamp-based identifiers
- Created users are deleted at the end of the test suite
- Mock mode requires no cleanup (no real data created)

### Running Individual Tests

```bash
# Run with debug output
DEBUG=true npm run test

# Run specific test file
npm test okta-api.test.ts
```

### Test Structure

```typescript
// Example test structure
describe('User Management Functions', () => {
  it('Should create a new user', async () => {
    const result = await mclient.callTool({
      name: "create-user",
      arguments: { 
        email: "test@example.com",
        firstName: "Test",
        lastName: "User"
      }
    });
    
    expect(result.isError).toBeFalsy();
    expect(result.content).toBeDefined();
  });
});
```

### CI/CD Integration

For continuous integration, use mock mode to avoid API rate limits and data pollution:

```yaml
# GitHub Actions example
- name: Run Tests
  run: npm run test
  env:
    NODE_ENV: test
```

## Security Considerations

- **API Token Security**: Store tokens securely and rotate regularly
- **Least Privilege**: Use admin roles with minimum required permissions
- **Network Security**: Consider IP restrictions and network zones
- **Audit Logging**: Monitor system logs for unauthorized access
- **Environment Separation**: Use separate tokens for development/production

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Verify `OKTA_ORG_URL` is correct (include https://)
   - Check API token validity and permissions
   - Ensure token hasn't expired

2. **Permission Denied**
   - Verify admin role assignments
   - Check if specific operations require higher privileges

3. **Network Issues**
   - Verify network connectivity to Okta
   - Check firewall and proxy settings
   - Validate SSL/TLS configuration

4. **Resource Not Found**
   - Verify user/group/app IDs are correct
   - Check if resources exist in your organization

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (including mock mode)
5. Submit a pull request

## License

[License information to be added]

## Support

For issues and questions:
- Check the troubleshooting section
- Review Okta API documentation
- Open an issue in the project repository