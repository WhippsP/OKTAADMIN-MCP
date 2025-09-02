import { z } from "zod";
import pkg from '@okta/okta-sdk-nodejs';

const { Client } = pkg;

const ListGroupsInputSchema = z.object({
    limit: z.number().optional().describe("Maximum number of groups to return (default: 20)")
});

const GroupIdInputSchema = z.object({
    groupId: z.string().describe("The ID of the group")
});

const CreateGroupInputSchema = z.object({
    name: z.string().describe("Name of the group"),
    description: z.string().optional().describe("Description of the group")
});

const GroupUserInputSchema = z.object({
    groupId: z.string().describe("The ID of the group"),
    userId: z.string().describe("The ID of the user")
});

export function createGroupManagement(client: InstanceType<typeof Client>) {
    return {
        listGroups: {
            name: "list-groups",
            description: "Lists all groups in the Okta organization",
            inputSchema: ListGroupsInputSchema,
            execute: async ({ limit = 20 }: { limit?: number }) => {
                try {
                    const groupsCollection = await client.groupApi.listGroups({ limit });
                    const groups: pkg.Group[] = [];
                    await groupsCollection.each(group => groups.push(group));

                    return {
                        content: [{
                            type: "text" as const,
                            text: groups.length === 0
                                ? "No groups found."
                                : `Found ${groups.length} groups:\n\n${JSON.stringify(groups, null, 2)}`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error fetching groups: ${err}` }],
                        isError: true,
                    };
                }
            }
        },
        getGroup: {
            name: "get-group",
            description: "Gets details of a specific group",
            inputSchema: GroupIdInputSchema,
            execute: async ({ groupId }: { groupId: string }) => {
                try {
                    const group = await client.groupApi.getGroup({ groupId });
                    return {
                        content: [{
                            type: "text" as const,
                            text: `Group details:\n\n${JSON.stringify(group, null, 2)}`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error fetching group: ${err}` }],
                        isError: true,
                    };
                }
            }
        },
        createGroup: {
            name: "create-group",
            description: "Creates a new group",
            inputSchema: CreateGroupInputSchema,
            execute: async ({ name, description }: { name: string, description?: string }) => {
                try {
                    const newGroup = {
                        profile: {
                            name: name,
                            description: description || `Group: ${name}`
                        }
                    };

                    const group = await client.groupApi.createGroup({ group: newGroup });
                    return {
                        content: [{
                            type: "text" as const,
                            text: `Group created successfully:\n\n${JSON.stringify(group, null, 2)}`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error creating group: ${err}` }],
                        isError: true,
                    };
                }
            }
        },
        addUserToGroup: {
            name: "add-user-to-group",
            description: "Adds a user to a group",
            inputSchema: GroupUserInputSchema,
            execute: async ({ groupId, userId }: { groupId: string, userId: string }) => {
                try {
                    await client.groupApi.assignUserToGroup({ groupId, userId });
                    return {
                        content: [{
                            type: "text" as const,
                            text: `User ${userId} added to group ${groupId} successfully.`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error adding user to group: ${err}` }],
                        isError: true,
                    };
                }
            }
        },
        removeUserFromGroup: {
            name: "remove-user-from-group",
            description: "Removes a user from a group",
            inputSchema: GroupUserInputSchema,
            execute: async ({ groupId, userId }: { groupId: string, userId: string }) => {
                try {
                    await client.groupApi.unassignUserFromGroup({ groupId, userId });
                    return {
                        content: [{
                            type: "text" as const,
                            text: `User ${userId} removed from group ${groupId} successfully.`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error removing user from group: ${err}` }],
                        isError: true,
                    };
                }
            }
        },
        listGroupUsers: {
            name: "list-group-users",
            description: "Lists all users in a specific group",
            inputSchema: GroupIdInputSchema,
            execute: async ({ groupId }: { groupId: string }) => {
                try {
                    const usersCollection = await client.groupApi.listGroupUsers({ groupId });
                    const users: pkg.User[] = [];
                    await usersCollection.each(user => users.push(user));

                    return {
                        content: [{
                            type: "text" as const,
                            text: users.length === 0
                                ? "No users found in this group."
                                : `Found ${users.length} users in group:\n\n${JSON.stringify(users, null, 2)}`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error fetching group users: ${err}` }],
                        isError: true,
                    };
                }
            }
        }
    };
}