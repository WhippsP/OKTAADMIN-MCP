import { z } from "zod";
import pkg from '@okta/okta-sdk-nodejs';

const { Client } = pkg;

const FactorManagementInputSchema = z.object({
    userId: z.string().describe("The ID of the user to manage factors for"),
});

type userIdInput = z.infer<typeof FactorManagementInputSchema>;

export function createFactorManagement(client: InstanceType<typeof Client>) {
    return {
        listUserFactors: {
            name: "list-user-factors",
            description: "Lists all factors (MFA methods) for a user",
            inputSchema: FactorManagementInputSchema,
            execute: async ({ userId }: userIdInput) => {
                try {
                    const factorsCollection = await client.userFactorApi.listFactors({ userId });
                    const factors: pkg.UserFactor[] = [];
                    await factorsCollection.each(factor => {
                        factors.push(factor);
                    });

                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: factors.length === 0
                                    ? "No factors found for this user."
                                    : `Found ${factors.length} factors:\n\n${JSON.stringify(factors, null, 2)}`
                            }
                        ]
                    };
                } catch (err) {
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `Error fetching user factors: ${err}`
                            }
                        ],
                        isError: true,
                    };
                }
            }
        }
        // ...add other tools here as needed
    };
}
/*
server.tool(
    "list-user-factors",
    "Lists all factors (MFA methods) for a user",
    z.object({
        userId: z.string().describe("The ID of the user")
    }).shape ?? {},
    async ({userId}: {userId: string}) => {
        try {
            const factorsCollection = await client.userFactorApi.listFactors({ userId });
            const factors: pkg.UserFactor[] = [];
            await factorsCollection.each(factor => {
                factors.push(factor);
            });

            return {
                content: [
                    {
                        type: "text",
                        text: factors.length === 0
                            ? "No factors found for this user."
                            : `Found ${factors.length} factors:\n\n${JSON.stringify(factors, null, 2)}`
                    }
                ]
            };
        } catch (err) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error fetching user factors: ${err}`
                    }
                ],
                isError: true,
            };
        }
    }
);

server.tool(
    "reset-user-factors",
    "Resets all factors for a user",
    z.object({
        userId: z.string().describe("The ID of the user")
    }).shape ?? {},
    async ({userId}: {userId: string}) => {
        try {
            await client.userFactorApi.resetFactors({ userId });
            return {
                content: [
                    {
                        type: "text",
                        text: `All factors reset for user ${userId}.`
                    }
                ]
            };
        } catch (err) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error resetting user factors: ${err}`
                    }
                ],
                isError: true,
            };
        }
    }
);
*/