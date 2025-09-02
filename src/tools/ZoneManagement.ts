import { z } from "zod";
import pkg from '@okta/okta-sdk-nodejs';

const { Client } = pkg;

export function createZoneManagement(client: InstanceType<typeof Client>) {
    return {
        listZones: {
            name: "list-zones",
            description: "Lists all network zones",
            inputSchema: z.object({}),
            execute: async () => {
                try {
                    const zonesCollection = await client.networkZoneApi.listNetworkZones();
                    const zones: pkg.NetworkZone[] = [];
                    await zonesCollection.each(zone => zones.push(zone));

                    return {
                        content: [{
                            type: "text" as const,
                            text: zones.length === 0
                                ? "No network zones found."
                                : `Found ${zones.length} network zones:\n\n${JSON.stringify(zones, null, 2)}`
                        }]
                    };
                } catch (err) {
                    return {
                        content: [{ type: "text" as const, text: `Error fetching network zones: ${err}` }],
                        isError: true,
                    };
                }
            }
        }
    };
}