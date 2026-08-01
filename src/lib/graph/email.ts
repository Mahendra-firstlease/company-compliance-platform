import { Client } from "@microsoft/microsoft-graph-client";
import { ClientSecretCredential } from "@azure/identity";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";

// Configuration for Microsoft Graph API OAuth Credentials (supports both MS_GRAPH_* and MS_* env names)
const TENANT_ID = process.env.MS_GRAPH_TENANT_ID || process.env.MS_TENANT_ID || "";
const CLIENT_ID = process.env.MS_GRAPH_CLIENT_ID || process.env.MS_CLIENT_ID || "";
const CLIENT_SECRET = process.env.MS_GRAPH_CLIENT_SECRET || process.env.MS_CLIENT_SECRET || "";
const SENDER_EMAIL = process.env.MS_GRAPH_SENDER_EMAIL || process.env.MS_SENDER_EMAIL || "";

/**
 * Initialize Microsoft Graph Client with Azure App Registration Client Secret Credential
 */
export function getGraphClient(): Client | null {
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    return null;
  }

  try {
    const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    const authProvider = new TokenCredentialAuthenticationProvider(credential, {
      scopes: ["https://graph.microsoft.com/.default"],
    });

    return Client.initWithMiddleware({ authProvider });
  } catch (err) {
    console.error("[MSGraph] Error initializing Microsoft Graph client:", err);
    return null;
  }
}

/**
 * Pre-flight test to verify if Microsoft Graph client can resolve the sender user/mailbox.
 * Useful for diagnosing 403 Forbidden vs 404 User Not Found issues.
 */
export async function verifyGraphMailbox(senderEmail?: string) {
  const graphClient = getGraphClient();
  if (!graphClient) {
    return { success: false, reason: "GRAPH_NOT_CONFIGURED" };
  }

  const targetEmail = (senderEmail || SENDER_EMAIL).replace(/^.*<([^>]+)>$/, "$1").trim();
  if (!targetEmail) {
    return { success: false, reason: "SENDER_MISSING" };
  }

  try {
    const userProfile = await graphClient.api(`/users/${targetEmail}`).select("id,displayName,userPrincipalName,mail").get();
    return {
      success: true,
      user: userProfile,
    };
  } catch (err: unknown) {
    const e = err as { statusCode?: number; status?: number; message?: string };
    return {
      success: false,
      statusCode: e?.statusCode || e?.status || 500,
      error: e?.message || String(err),
    };
  }
}

export interface SendGraphEmailOptions {
  to: string;
  subject: string;
  html: string;
  plainText?: string;
}

/**
 * Send Email via Microsoft Graph API (Recommended for Microsoft 365 / Outlook / Exchange)
 */
export async function sendEmailViaGraph({
  to,
  subject,
  html,
}: SendGraphEmailOptions) {
  const graphClient = getGraphClient();
  if (!graphClient) {
    console.warn(
      "[MSGraph] Microsoft Graph credentials (MS_GRAPH_TENANT_ID / MS_TENANT_ID, MS_GRAPH_CLIENT_ID / MS_CLIENT_ID, MS_GRAPH_CLIENT_SECRET / MS_CLIENT_SECRET) are missing."
    );
    return { success: false, reason: "GRAPH_NOT_CONFIGURED" };
  }

  // Extract clean email address if sender includes display name e.g. "Company <noreply@company.com>"
  const cleanSender = SENDER_EMAIL.replace(/^.*<([^>]+)>$/, "$1").trim();

  if (!cleanSender) {
    console.error("[MSGraph] Microsoft Graph sender email (MS_GRAPH_SENDER_EMAIL / MS_SENDER_EMAIL) is missing.");
    return { success: false, reason: "SENDER_MISSING" };
  }

  try {
    const sendMailPayload = {
      message: {
        subject,
        body: {
          contentType: "HTML",
          content: html,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
      },
      saveToSentItems: true,
    };

    console.log(`[MSGraph] Dispatching email to ${to} via Microsoft Graph API (/users/${cleanSender}/sendMail)...`);

    const res = await graphClient
      .api(`/users/${cleanSender}/sendMail`)
      .post(sendMailPayload);

    const logDetails = {
      status: "SUCCESS 🟢",
      statusCode: 202,
      statusText: "202 Accepted (Queued for Delivery via Microsoft Graph API)",
      provider: "MICROSOFT_GRAPH_API",
      recipient: to,
      sender: cleanSender,
      subject,
      rawResponse: res || "No Content (202 OK)",
      timestamp: new Date().toISOString(),
    };

    console.log("===================== EMAIL DISPATCH STATUS RESPONSE =====================");
    console.dir(logDetails, { depth: null, colors: true });
    console.log("==========================================================================");

    return {
      success: true,
      provider: "MS_GRAPH",
      statusCode: 202,
      details: logDetails,
    };
  } catch (err: unknown) {
    const e = err as { statusCode?: number; status?: number; message?: string };
    const statusCode = e?.statusCode || e?.status || 500;
    const errorMessage = e?.message || String(err);

    const errorDetails: Record<string, unknown> = {
      status: "FAILED 🔴",
      statusCode,
      provider: "MICROSOFT_GRAPH_API",
      recipient: to,
      sender: cleanSender,
      subject,
      error: errorMessage,
      timestamp: new Date().toISOString(),
    };

    if (statusCode === 403) {
      errorDetails.troubleshooting = {
        issue: "403 Forbidden - Access Denied by Microsoft Graph API",
        checks: [
          "1. Check Microsoft Entra ID → App registrations → API permissions.",
          "2. Ensure 'Mail.Send' is added as an APPLICATION permission (not Delegated permission).",
          "3. Ensure 'Grant admin consent for <Organization>' has been clicked and granted in Entra ID.",
          `4. Confirm that '${cleanSender}' is an active, licensed Microsoft 365 mailbox within tenant '${TENANT_ID}'.`,
          "5. Verify client credentials scopes are using 'https://graph.microsoft.com/.default'.",
        ],
      };
    }

    console.error("===================== EMAIL DISPATCH ERROR RESPONSE =====================");
    console.dir(errorDetails, { depth: null, colors: true });
    console.log("=========================================================================");

    return {
      success: false,
      statusCode,
      error: errorMessage,
      details: errorDetails,
    };
  }
}

/**
 * Diagnostic helper to log non-sensitive configuration state
 */
export function checkGraphConfig() {
  const config = {
    tenantConfigured: Boolean(TENANT_ID),
    tenantIdPrefix: TENANT_ID ? TENANT_ID.slice(0, 8) + "..." : "NONE",
    clientConfigured: Boolean(CLIENT_ID),
    clientIdPrefix: CLIENT_ID ? CLIENT_ID.slice(0, 8) + "..." : "NONE",
    secretConfigured: Boolean(CLIENT_SECRET),
    senderConfigured: Boolean(SENDER_EMAIL),
    senderEmail: SENDER_EMAIL || "NONE",
  };

  console.log("[MSGraph] Current Configuration State:", config);
  return config;
}

/**
 * Diagnostic function to acquire and decode Graph OAuth Access Token claims.
 * Checks for "roles": ["Mail.Send"] (Application Permission) vs "scp" (Delegated Permission).
 */
export async function debugGraphToken() {
  if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET) {
    return { success: false, error: "Missing Microsoft Graph credentials in environment variables." };
  }

  try {
    const credential = new ClientSecretCredential(TENANT_ID, CLIENT_ID, CLIENT_SECRET);
    const token = await credential.getToken("https://graph.microsoft.com/.default");

    if (!token || !token.token) {
      console.log("[MSGraph Token Debug] No token received from Microsoft Entra ID.");
      return { success: false, error: "No token received from Microsoft Entra ID." };
    }

    const payload = JSON.parse(
      Buffer.from(token.token.split(".")[1], "base64url").toString()
    );

    const tokenClaims = {
      aud: payload.aud,
      tenantId: payload.tid,
      appId: payload.appid,
      roles: payload.roles || [],
      scopes: payload.scp || null,
      hasMailSendRole: Array.isArray(payload.roles) && payload.roles.includes("Mail.Send"),
    };

    console.log("===================== GRAPH TOKEN DEBUG CLAIMS =====================");
    console.dir(tokenClaims, { depth: null, colors: true });
    console.log("====================================================================");

    return {
      success: true,
      tokenClaims,
    };
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error("[MSGraph Token Debug] Error acquiring or decoding token:", err);
    return {
      success: false,
      error: e?.message || String(err),
    };
  }
}


