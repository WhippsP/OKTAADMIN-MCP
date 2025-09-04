// devicecode-client.ts
import okta from "@okta/okta-sdk-nodejs";

const Client = okta.Client;

interface TokenEndpointResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  id_token?: string;
}

function formatParams(obj: Record<string, any>): string {
  const str: string[] = [];
  if (obj !== null) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key) &&
          obj[key] !== undefined &&
          obj[key] !== null) {
        str.push(key + '=' + encodeURIComponent(obj[key]));
      }
    }
  }
  return str.length ? str.join('&') : '';
}


export class DeviceCodeClient extends Client {
  private deviceCode?: string;
  private deviceCodeExpiresAt?: number;

  constructor(config: any) {
    super(config);

    if (this.oauth) {
      this.oauth.getAccessToken = async (): Promise<TokenEndpointResponse> => {
        if (this.oauth.accessToken && Date.now()) {
          return this.oauth.accessToken;
        }

        if (!this.deviceCode || (this.deviceCodeExpiresAt && Date.now() > this.deviceCodeExpiresAt)) {
          const deviceCodeReq = await this.requestDeviceCode();
          this.deviceCode = deviceCodeReq.device_code;
          this.deviceCodeExpiresAt = Date.now() + (deviceCodeReq.expires_in * 1000);

          // Throw error so client can prompt user
          throw new Error(
            `OKTA MCP Not authenticated. Please login using: ${deviceCodeReq.verification_uri_complete}`
          );
        }

        const token = await this.pollDeviceCodeOnce(this.deviceCode!);

        if (!token) {
          // User hasn’t authorized yet
          throw new Error(
            `OKTA MCP Not authenticated. Please login using the previously provided URL.`
          );
        }
        this.oauth.accessToken = token;
        return token;
      };
    }
  }

  private async requestDeviceCode(): Promise<{
    device_code: string;
    user_code: string;
    verification_uri_complete: string;
    expires_in: number;
  }> {

    const endpoint = "/oauth2/v1/device/authorize";

    const jwt = await this.oauth.getJwt(endpoint);

    const params = formatParams({
          scope: this.oauth.client.scopes.join(" "),
          client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
          client_assertion: jwt
    });

    const res = await (this.oauth!.client.requestExecutor as any).fetch({
      url: `${this.oauth.client.baseUrl}${endpoint}`,
      method: "POST",
      body: params,
      headers: { "Accept": "application/json",
                 "Content-Type": "application/x-www-form-urlencoded" },

    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Device code request failed: ${res.status} ${text}`);
    }

    return await res.json();
  }

  private async pollDeviceCodeOnce(deviceCode: string): Promise<TokenEndpointResponse | null> {
    const endpoint = "/oauth2/v1/token";
    const jwt = await this.oauth.getJwt(endpoint);
    const res = await (this.oauth!.client.requestExecutor as any).fetch({
      url: `${this.oauth!.client.baseUrl}/oauth2/v1/token`,
      method: "POST",
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        device_code: deviceCode,
        client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
        client_assertion: jwt
      }).toString(),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      if (json.error === "authorization_pending") {
        return null; // user has not authorized yet
      }
      throw new Error(`Token polling failed: ${res.status} ${JSON.stringify(json)}`);
    }

    return await res.json();
  }
}

