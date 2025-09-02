import { z } from "zod";
import pkg from '@okta/okta-sdk-nodejs';

const { Client } = pkg;

const ListSystemLogsInputSchema = z.object({
    limit: z.number().optional().describe("Maximum number of log entries to return (default: 100)"),
    since: z.string().optional().describe("Timestamp to start from (ISO 8601 format)")
});

export function createSystemManagement(client: InstanceType<typeof Client>) {
    return {
        listSystemLogs: {
            name: "list-system-logs",
            description: "Retrieves system logs",
            inputSchema: ListSystemLogsInputSchema,
            execute: async ({ limit = 100, since }: { limit?: number, since?: string }) => {
                try {
                    const logsCollection = await client.systemLogApi.listLogEvents({
                        limit,
                        since: since ? (new Date(since)).toISOString() : undefined
                    });
                    const logs: pkg.LogEvent[] = [];
                    await logsCollection.each(log => logs.push(log));

                    return {
                        content: [{
                            type: "text" as const,
                            text: logs.length === 0
                                ? "No logs found."
                                : `Found ${logs.length} log entries:\n\n${JSON.stringify(logs, null, 2)}`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error fetching logs: ${err}` }],
                        isError: true,
                    };
                }
            }
        }
    };
}