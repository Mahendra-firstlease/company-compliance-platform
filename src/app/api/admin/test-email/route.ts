import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendEmailViaGraph, verifyGraphMailbox, debugGraphToken, checkGraphConfig } from "@/lib/graph/email";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json(
      { error: "Access denied. Admin privileges required." },
      { status: 403 }
    );
  }

  const config = checkGraphConfig();
  const tokenDebug = await debugGraphToken();
  const mailboxCheck = await verifyGraphMailbox();

  // Log detailed claims safely on server-side only
  if (tokenDebug.success) {
    console.log("[Test Email Diagnostics] Entra ID Token Claims Verified Server-Side");
  }

  return NextResponse.json({
    config,
    tokenValid: tokenDebug.success,
    hasMailSendPermission: tokenDebug.success ? Boolean(tokenDebug.tokenClaims?.hasMailSendRole) : false,
    mailboxReady: mailboxCheck.success,
  });
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Admin privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const targetEmail = body.to || "mahendrasinghddnuk@gmail.com";
    const subject = body.subject || "Microsoft Graph Test Email";

    // 1. Inspect token and mailbox status
    const tokenDebug = await debugGraphToken();
    const mailboxCheck = await verifyGraphMailbox();

    // 2. Attempt send mail
    const sendResult = await sendEmailViaGraph({
      to: targetEmail,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #0066cc;">Microsoft Graph API Connectivity Test</h2>
          <p>This is a test email sent from <strong>Compliance Portal India</strong> to verify Microsoft Graph email delivery.</p>
          <p><strong>Recipient:</strong> ${targetEmail}</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <hr />
          <p style="font-size: 12px; color: #777;">Sent via Microsoft 365 Client Credentials Flow</p>
        </div>
      `,
    });

    return NextResponse.json({
      success: sendResult.success,
      tokenValid: tokenDebug.success,
      mailboxReady: mailboxCheck.success,
      delivered: sendResult.success,
    });
  } catch (error: any) {
    console.error("[Test Email Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send diagnostic test email. Please check server logs.",
      },
      { status: 500 }
    );
  }
}
