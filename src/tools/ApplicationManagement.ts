import { z } from "zod";
import pkg from '@okta/okta-sdk-nodejs';

const { Client } = pkg;

const UserIdInputSchema = z.object({
    userId: z.string().describe("The ID of the user to fetch"),
});

const AppIdInputSchema = z.object({
    appId: z.string().describe("The ID of the application")
});

const AssignUserToAppInputSchema = z.object({
    appId: z.string().describe("The ID of the application"),
    userId: z.string().describe("The ID of the user")
});

const ListApplicationsInputSchema = z.object({
    limit: z.number().optional().describe("Maximum number of applications to return (default: 20)")
});

export function createApplicationManagement(client: InstanceType<typeof Client>) {
    return {
        getUserApps: {
            name: "get-user-apps",
            description: "Gets all applications assigned to an Okta user by ID",
            inputSchema: UserIdInputSchema,
            execute: async ({ userId }: { userId: string }) => {
                try {
                    const appsCollection = await client.userApi.listAppLinks({ userId: userId });
                    const apps: pkg.AssignedAppLink[] = [];
                    await appsCollection.each(app => apps.push(app));

                    return {
                        content: [{
                            type: "text" as const,
                            text: apps.length === 0
                                ? "No applications found for this user."
                                : `Found ${apps.length} applications:\n\n${JSON.stringify(apps, null, 2)}`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error fetching user applications: ${err}` }],
                        isError: true,
                    };
                }
            }
        },
        listApplications: {
            name: "list-applications",
            description: "Lists all applications in the Okta organization",
            inputSchema: ListApplicationsInputSchema,
            execute: async ({ limit = 20 }: { limit?: number }) => {
                try {
                    const appsCollection = await client.applicationApi.listApplications({ limit });
                    const apps: pkg.Application[] = [];
                    await appsCollection.each(app => apps.push(app));

                    return {
                        content: [{
                            type: "text" as const,
                            text: apps.length === 0
                                ? "No applications found."
                                : `Found ${apps.length} applications:\n\n${JSON.stringify(apps, null, 2)}`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error fetching applications: ${err}` }],
                        isError: true,
                    };
                }
            }
        },
        getApplication: {
            name: "get-application",
            description: "Gets details of a specific application",
            inputSchema: AppIdInputSchema,
            execute: async ({ appId }: { appId: string }) => {
                try {
                    const app = await client.applicationApi.getApplication({ appId });
                    return {
                        content: [{
                            type: "text" as const,
                            text: `Application details:\n\n${JSON.stringify(app, null, 2)}`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error fetching application: ${err}` }],
                        isError: true,
                    };
                }
            }
        },
        assignUserToApp: {
            name: "assign-user-to-app",
            description: "Assigns a user to an application",
            inputSchema: AssignUserToAppInputSchema,
            execute: async ({ appId, userId }: { appId: string, userId: string }) => {
                try {
                    const assignment = await client.applicationApi.assignUserToApplication({
                        appId: appId,
                        appUser: { id: userId }
                    });
                    return {
                        content: [{
                            type: "text" as const,
                            text: `User ${userId} assigned to application ${appId}:\n\n${JSON.stringify(assignment, null, 2)}`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error assigning user to application: ${err}` }],
                        isError: true,
                    };
                }
            }
        }
    };
}