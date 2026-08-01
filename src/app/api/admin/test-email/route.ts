import { NextRequest, NextResponse } from "next/server";
import { sendEmailViaGraph, verifyGraphMailbox, debugGraphToken, checkGraphConfig } from "@/lib/graph/email";

export async function GET() {
  const config = checkGraphConfig();
  const tokenDebug = await debugGraphToken();
  const mailboxCheck = await verifyGraphMailbox();

  return NextResponse.json({
    config,
    tokenClaims: tokenDebug.success ? tokenDebug.tokenClaims : null,
    tokenError: tokenDebug.error || null,
    mailboxCheck,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const targetEmail = body.to || "mahendrasinghddnuk@gmail.com";
    const subject = body.subject || "Microsoft Graph Test Email";

    // 1. Inspect token claims
    const tokenDebug = await debugGraphToken();

    // 2. Verify mailbox accessibility
    const mailboxCheck = await verifyGraphMailbox();

    // 3. Attempt send mail
    const sendResult = await sendEmailViaGraph({
      to: targetEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0066cc;">Microsoft Graph API Connectivity Test</h2>
          <p>This is a test email sent from <strong>FirstLease Compliance Platform</strong> to verify Microsoft Graph email delivery.</p>
          <p><strong>Recipient:</strong> ${targetEmail}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr />
          <p style="font-size: 12px; color: #777;">Sent via Microsoft 365 Client Credentials Flow</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: sendResult.success,
      tokenClaims: tokenDebug.success ? tokenDebug.tokenClaims : null,
      mailboxVerification: mailboxCheck,
      sendResult,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
