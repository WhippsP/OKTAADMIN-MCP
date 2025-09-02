import { z } from "zod";
import pkg from '@okta/okta-sdk-nodejs';

const { Client } = pkg;

const UserNameInputSchema = z.object({
    userId: z.string().describe("The ID of the user to manage factors for"),
});

const UserCreateInputSchema = z.object({
        email: z.string().describe("User's email address"),
        firstName: z.string().describe("User's first name"),
        lastName: z.string().describe("User's last name"),
        activate: z.boolean().optional().describe("Whether to activate the user immediately (default: true)")
    });

const UserUpdateInputSchema = z.object({
        userId: z.string().describe("The ID of the user to update"),
        firstName: z.string().optional().describe("User's first name"),
        lastName: z.string().optional().describe("User's last name"),
        email: z.string().optional().describe("User's email address"),
        mobilePhone: z.string().optional().describe("User's mobile phone")
    });

type userIdInput = z.infer<typeof UserNameInputSchema>;

export function createUserManagement(client: InstanceType<typeof Client>) {
    return {
        listUsers: {
            name: "list-user",
            description: "Lists all users in the Okta organization",
            inputSchema: z.object({}),
            execute: async () => {
                try {
                    const collection = await client.userApi.listUsers();
                    const usrs: pkg.User[] = [];
                    await collection.each(user => {
                        usrs.push(user);
                    });

                    console.error("Total users found:", usrs.length);

                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: usrs.length === 0 
                                    ? "No users found in the Okta organization."
                                    : `Found ${usrs.length} users:\n\n${JSON.stringify(usrs, null, 2)}`
                            }
                        ],
                        isError: false,
                    };
                } catch (err) {
                    console.error("Error fetching users:", err);
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `Error fetching users: ${err}`
                            }
                        ],
                        isError: true,
                    };
                }
            }
        },
        getUser: {
            name: "get-user",
            description: "Gets a specific user by ID",
            inputSchema: UserNameInputSchema,
            execute: async ({ userId }: userIdInput) => {
                try {
                        const user = await client.userApi.getUser({ userId });
                        return {
                            content: [
                                {
                                    type: "text" as const,
                                    text: `User details:\n\n${JSON.stringify(user, null, 2)}`
                                }
                            ]
                        };
                    } catch (err) {
                        return {
                            content: [
                                {
                                    type: "text" as const,
                                    text: `Error fetching user: ${err}`
                                }
                            ],
                            isError: true,
                        };
                    }
            }
        },
        createUser: {
            name: "create-user",
            description: "Creates a new user in Okta",
            inputSchema: UserCreateInputSchema,
            execute: async ({email, firstName, lastName, activate = true}: {email: string, firstName: string, lastName: string, activate?: boolean}) => {
                try {
                        const newUser = {
                            profile: {
                                email: email,
                                login: email,
                                firstName: firstName,
                                lastName: lastName
                            }
                        };

                        const user = await client.userApi.createUser({
                            body: newUser,
                            activate: activate
                        });

                        return {
                            content: [
                                {
                                    type: "text" as const,
                                    text: `User created successfully:\n\n${JSON.stringify(user, null, 2)}`
                                }
                            ]
                        };
                    } catch (err) {
                        return {
                            content: [{ type: "text" as const, text: `Error creating user: ${err}` }],
                            isError: true,
                        };
                    }
                }
        },
        updateuser: {
            name: "update-user",
            description: "Updates an existing user in Okta",
            inputSchema: UserUpdateInputSchema,
            execute: async ({userId, email, firstName, lastName, mobilePhone}: {userId: string, email?: string, firstName?: string, lastName?: string, mobilePhone?: string }) => {
                try {
                    const updates: any = {};
                    if (firstName) updates.firstName = firstName;
                    if (lastName) updates.lastName = lastName;
                    if (email) updates.email = email;
                    if (mobilePhone) updates.mobilePhone = mobilePhone;

                    const user = await client.userApi.updateUser({
                        userId: userId,
                        user: { profile: updates }
                    });

                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `User updated successfully:\n\n${JSON.stringify(user, null, 2)}`
                            }
                        ]
                    };
                } catch (err) {
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `Error updating user: ${err}`
                            }
                        ],
                        isError: true,
                    };
                }
            }
        },
        disableuser: {
            name: "disable-user",
            description: "Disables an existing user in Okta",
            inputSchema: UserUpdateInputSchema,
            execute: async ({userId}: {userId: string}) => {
                try {
                    await client.userApi.deactivateUser({ userId: userId });
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `User with ID ${userId} has been disabled.`
                            }
                        ]
                    };
                } catch (err) {
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `Error disabling user: ${err}`
                            }
                        ],
                        isError: true,
                    };
                }
            }
        },
        enableuser: {
            name: "enable-user",
            description: "Enables an existing user in Okta",
            inputSchema: UserUpdateInputSchema,
            execute: async ({userId}: {userId: string}) => {
                try {
                    await client.userApi.activateUser({ userId: userId });
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `User with ID ${userId} has been enabled.`
                            }
                        ]
                    };
                } catch (err) {
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `Error enabling user: ${err}`
                            }
                        ],
                        isError: true,
                    };
                }
            }
        },
        deleteuser: {
            name: "delete-user",
            description: "Permanently deletes a user in Okta",
            inputSchema: z.object({
                userId: z.string().describe("The ID of the user to delete"),
                sendEmail: z.boolean().optional().describe("Whether to send a deactivation email (default: false)")
            }),
            execute: async ({userId, sendEmail = false}: {userId: string, sendEmail?: boolean}) => {
                try {
                    await client.userApi.deleteUser({
                        userId: userId,
                        sendEmail: sendEmail
                    });
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `User with ID ${userId} has been permanently deleted.`
                            }
                        ]
                    };
                } catch (err) {
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `Error deleting user: ${err}`
                            }
                        ],
                        isError: true,
                    };
                }
            }
        },
        resetpassword: {
            name: "reset-user-password",
            description: "Resets a user's password",
            inputSchema: z.object({
                userId: z.string().describe("The ID of the user"),
                sendEmail: z.boolean().optional().describe("Whether to send reset email (default: false)")
            }),
            execute: async ({userId, sendEmail = false}: {userId: string, sendEmail?: boolean}) => {
                try {
                    const result = await client.userApi.generateResetPasswordToken({
                        userId: userId,
                        sendEmail: sendEmail
                    });
                    return {
                        content: [
                            {
                                type: "text" as const,
                                text: `Password reset initiated for user ${userId}:\n\n${JSON.stringify(result, null, 2)}`
                            }
                        ]
                    };
                } catch (err) {
                    return {
                        content: [
                            {    
                                type: "text" as const,
                                text: `Error resetting password: ${err}`
                            }
                        ],
                        isError: true,
                    };
                }
            }
        }
        
    };
}
