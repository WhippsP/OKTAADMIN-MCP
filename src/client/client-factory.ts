// client-factory.ts
import { createMockClient } from './mock-client.js';
import { DeviceCodeClient } from './devicecode-client.js';


export function createOktaClient(): InstanceType<any> {
  if (process.env.NODE_ENV === 'test') {
    console.error("Running in test mode - using mock client");
    return createMockClient();
  } else {
    console.error("Running in production mode - using real Okta client");
    if (!process.env.OKTA_ORG_URL) {
        throw new Error("Missing OKTA_ORG_URL environment variable");
    }
    if (!process.env.OKTA_API_TOKEN) {
       // Assume Device Code Flow
       return new DeviceCodeClient({
        orgUrl: process.env.OKTA_ORG_URL,
        authorizationMode: 'PrivateKey',
        clientId: process.env.OKTA_CLIENT_ID,
        scopes: ['okta.users.read', 'okta.users.manage', 'okta.apps.read', 'okta.apps.manage', 'okta.groups.read', 'okta.groups.manage', 'okta.factors.manage', 'okta.factors.read', 'okta.networkZones.read', 'okta.networkZones.manage'],
        privateKey: process.env.OKTA_PRIVATE_KEY,
        keyId: process.env.OKTA_KID
      });
    }
    return new DeviceCodeClient({
        orgUrl: process.env.OKTA_ORG_URL,
        token: process.env.OKTA_API_TOKEN
    });
  }
}