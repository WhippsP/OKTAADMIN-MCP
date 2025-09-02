// mock-client.ts
import pkg from '@okta/okta-sdk-nodejs';

const { Client } = pkg;

const mockUsers = [
  { id: "u1", profile: { login: "mock1@example.com", firstName: "Mock", lastName: "User1" } },
  { id: "u2", profile: { login: "mock2@example.com", firstName: "Mock", lastName: "User2" } },
];

const mockGroups = [
  { id: "g1", profile: { name: "Mock Group 1", description: "Test group 1" } },
  { id: "g2", profile: { name: "Mock Group 2", description: "Test group 2" } },
];

const mockApps = [
  { id: "app1", name: "Mock App 1", status: "ACTIVE" },
  { id: "app2", name: "Mock App 2", status: "INACTIVE" },
];

const createMockCollection = (items: any[]) => ({
  each: async (callback: (item: any) => void) => {
    for (const item of items) {
      await callback(item);
    }
  }
});

export function createMockClient(): InstanceType<typeof Client> {
  return {
    userApi: {
      listUsers: async () => createMockCollection(mockUsers),
      getUser: async (params: any) => mockUsers.find(u => u.id === params.userId) ?? (() => { throw new Error(`Error fetching user: OktaApiError: Okta HTTP 404 E0000007 Not found: Resource not found: ${params.userId} (User).`);  })(),

      createUser: async (params: any) => (
        mockUsers.push({
          id: params.body?.profile?.email || "new-user-id",
          profile: {
            login: params.body?.profile?.email || "new@example.com",
            firstName: params.body?.profile?.firstName || "New",
            lastName: params.body?.profile?.lastName || "User"
          }
        }),
        mockUsers.find(u => u.id === params.body?.profile?.email || "new-user-id") ),
      updateUser: async (params: any) => ({ 
        id: mockUsers[0]?.id, 
        profile: { 
          login: params.user?.profile?.login || mockUsers[0]?.profile.login, 
          firstName: params.user?.profile?.firstName || mockUsers[1]?.profile.firstName, 
          lastName: params.user?.profile?.lastName || mockUsers[0]?.profile.lastName 
        } 
      }),
      deactivateUser: async () => ({}),
      activateUser: async () => ({}),
      deleteUser: async () => ({}),
      listAppLinks: async () => createMockCollection([]),
      generateResetPasswordToken: async () => ({ resetPasswordUrl: "https://example.com/reset" }),
    },
    groupApi: {
      listGroups: async () => createMockCollection(mockGroups),
      getGroup: async () => mockGroups[0],
      createGroup: async (params: any) => ({
        id: "new-group-id",
        profile: {
          name: params.group?.profile?.name || "New Group",
          description: params.group?.profile?.description || "New Group Description"
        }
      }),
      assignUserToGroup: async () => ({}),
      unassignUserFromGroup: async () => ({}),
      listGroupUsers: async () => createMockCollection(mockUsers),
    },
    applicationApi: {
      listApplications: async () => createMockCollection(mockApps),
      getApplication: async () => mockApps[0],
      assignUserToApplication: async () => ({}),
    },
    systemLogApi: {
      listLogEvents: async () => createMockCollection([
        { id: "log1", eventType: "user.authentication.success", published: new Date().toISOString() }
      ]),
    },
    userFactorApi: {
      listFactors: async () => createMockCollection([]),
    },
    policyApi: {
      listPolicies: async () => createMockCollection([
        { id: "policy1", name: "Default Policy", type: "OKTA_SIGN_ON" }
      ]),
    },
    networkZoneApi: {
      listNetworkZones: async () => createMockCollection([
        { id: "zone1", name: "Corporate Network", type: "IP" }
      ]),
    }
  } as any;
}