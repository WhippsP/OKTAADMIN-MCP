import { z } from "zod";
import pkg from '@okta/okta-sdk-nodejs';

const { Client } = pkg;

const ListPoliciesInputSchema = z.object({
    type: z.string().optional().describe("Policy type to filter by (e.g., 'OKTA_SIGN_ON', 'PASSWORD')")
});

export function createPolicyManagement(client: InstanceType<typeof Client>) {
    return {
        listPolicies: {
            name: "list-policies",
            description: "Lists all policies in the organization",
            inputSchema: ListPoliciesInputSchema,
            execute: async ({ type }: { type?: string }) => {
                try {
                    const allowedTypes = [
                        "OKTA_SIGN_ON", "PASSWORD", "MFA_ENROLL", "IDP_DISCOVERY",
                        "ACCESS_POLICY", "PROFILE_ENROLLMENT", "POST_AUTH_SESSION", "ENTITY_RISK"
                    ] as const;
                    type PolicyType = typeof allowedTypes[number];

                    if (type && !allowedTypes.includes(type as PolicyType)) {
                        return {
                            content: [{
                                type: "text" as const,
                                text: `Policy Type not provided or invalid. Please use one of the following types: ${allowedTypes.join(", ")}`
                            }],
                            isError: true,
                        };
                    }

                    let options: { type: PolicyType };
                    if (type && allowedTypes.includes(type as PolicyType)) {
                        options = { type: type as PolicyType };
                    } else {
                        return {
                            content: [{
                                type: "text" as const,
                                text: `Policy Type not provided or invalid. Please use one of the following types: ${allowedTypes.join(", ")}`
                            }],
                            isError: true,
                        };
                    }

                    const policiesCollection = await client.policyApi.listPolicies(options);
                    const policies: pkg.Policy[] = [];
                    await policiesCollection.each(policy => policies.push(policy));

                    return {
                        content: [{
                            type: "text" as const,
                            text: policies.length === 0
                                ? "No policies found."
                                : `Found ${policies.length} policies:\n\n${JSON.stringify(policies, null, 2)}`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error fetching policies: ${err}` }],
                        isError: true,
                    };
                }
            }
        }
    };
}