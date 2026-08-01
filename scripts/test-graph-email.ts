import "dotenv/config";
import { sendEmailViaGraph, verifyGraphMailbox, debugGraphToken, checkGraphConfig } from "../src/lib/graph/email";

async function main() {
  console.log("==========================================================================");
  console.log("🔍 MICROSOFT GRAPH API EMAIL DIAGNOSTIC TEST");
  console.log("==========================================================================");

  // 0. Configuration State Inspection
  checkGraphConfig();

  const tenantId = process.env.MS_GRAPH_TENANT_ID || process.env.MS_TENANT_ID;
  const clientId = process.env.MS_GRAPH_CLIENT_ID || process.env.MS_CLIENT_ID;
  const clientSecret = process.env.MS_GRAPH_CLIENT_SECRET || process.env.MS_CLIENT_SECRET;
  const senderEmail = process.env.MS_GRAPH_SENDER_EMAIL || process.env.MS_SENDER_EMAIL;

  if (!tenantId || !clientId || !clientSecret || !senderEmail) {
    console.error("\n❌ ERROR: Missing required environment variables in .env / .env.local!");
    console.error("Please ensure MS_GRAPH_TENANT_ID, MS_GRAPH_CLIENT_ID, MS_GRAPH_CLIENT_SECRET, and MS_GRAPH_SENDER_EMAIL are set.");
    process.exit(1);
  }

  // 1. Token Claims Inspection (Decodes JWT token without logging secret/token string)
  console.log("\n🔑 Step 1: Acquiring & Inspecting OAuth Access Token Claims...");
  const tokenDebug = await debugGraphToken();

  if (tokenDebug.success && tokenDebug.tokenClaims) {
    const { aud, tenantId, appId, roles, scopes, hasMailSendRole } = tokenDebug.tokenClaims;
    console.log(` - Audience (aud)  : ${aud}`);
    console.log(` - Tenant ID (tid) : ${tenantId}`);
    console.log(` - App ID (appid)  : ${appId}`);
    console.log(` - Roles (Application permissions) : ${JSON.stringify(roles)}`);
    console.log(` - Scopes (Delegated permissions)  : ${JSON.stringify(scopes)}`);

    if (hasMailSendRole) {
      console.log("🟢 Mail.Send Application Role confirmed in token!");
    } else {
      console.error("🔴 CRITICAL: 'Mail.Send' is MISSING from token 'roles' array!");
      console.error("   This confirms Entra ID has NOT granted Application permission for Mail.Send to this App Registration.");
    }
  } else {
    console.error("🔴 Token acquisition failed:", tokenDebug.error);
  }

  // 2. Pre-flight Check: Verify Mailbox User
  console.log("\n📡 Step 2: Pre-flight User Verification (GET /users/" + senderEmail + ")...");
  const mailboxResult = await verifyGraphMailbox(senderEmail);

  if (mailboxResult.success) {
    console.log("🟢 Mailbox Verified Successfully!");
    console.log(` - User ID: ${mailboxResult.user?.id}`);
    console.log(` - Display Name: ${mailboxResult.user?.displayName}`);
    console.log(` - UPN: ${mailboxResult.user?.userPrincipalName}`);
  } else {
    console.error("🔴 Pre-flight User Check Failed!");
    console.error(` - Status Code: ${mailboxResult.statusCode || "N/A"}`);
    console.error(` - Error: ${mailboxResult.error}`);
  }

  // 3. Dispatch Test Email
  const recipient = process.argv[2] || "mahendrasinghddnuk@gmail.com";
  console.log(`\n✉️  Step 3: Dispatching Test Email to ${recipient}...`);

  const sendResult = await sendEmailViaGraph({
    to: recipient,
    subject: "Microsoft Graph Connection Test",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #0066cc; margin-top: 0;">Microsoft Graph API Live Test</h2>
        <p>This email confirms that your Next.js application is successfully authenticated and authorized to send email via Microsoft Graph API.</p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p style="font-size: 13px; color: #555;">
          <strong>Sender:</strong> ${senderEmail}<br/>
          <strong>Recipient:</strong> ${recipient}<br/>
          <strong>Timestamp:</strong> ${new Date().toISOString()}
        </p>
      </div>
    `,
  });

  if (sendResult.success) {
    console.log("\n🎉 SUCCESS 🟢 Email queued & accepted by Microsoft Graph API (Status 202 Accepted)!");
  } else {
    console.error("\n❌ FAILED 🔴 Email dispatch failed!");
    console.error(` - Status Code: ${sendResult.statusCode || "N/A"}`);
    console.error(` - Error: ${sendResult.error}`);
  }

  console.log("==========================================================================\n");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
