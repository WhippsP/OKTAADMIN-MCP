// client-factory.ts
import pkg from '@okta/okta-sdk-nodejs';
import { createMockClient } from './mock-client.js';


const { Client } = pkg;

export function createOktaClient(): InstanceType<typeof Client> {
  if (process.env.NODE_ENV === 'test') {
    console.error("Running in test mode - using mock client");
    return createMockClient();
  } else {
    console.error("Running in production mode - using real Okta client");
    return new Client({
        orgUrl: process.env.OKTA_ORG_URL,
        token: process.env.OKTA_API_TOKEN
    });
  }
}