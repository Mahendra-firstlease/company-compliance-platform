import { describe, expect, it } from "vitest";
import {
  canAdvanceWorkflowStatus,
  getWorkflowBlockers,
  isFormDataApproved,
} from "../application-workflow";

describe("application-workflow", () => {
  it("requires form approval when submitted form fields exist", () => {
    expect(
      isFormDataApproved({ applicantName: "Asha", _formDataApproved: false }),
    ).toBe(false);
    expect(
      isFormDataApproved({ applicantName: "Asha", _formDataApproved: true }),
    ).toBe(true);
  });

  it("auto-approves when there are no submitted form fields", () => {
    expect(isFormDataApproved({ _docVerification: {} })).toBe(true);
  });

  it("blocks ministry submission until form data and files are approved", () => {
    const blockers = getWorkflowBlockers({
      currentStatus: "UNDER_REVIEW",
      targetStatus: "SUBMITTED",
      formData: { applicantName: "Asha" },
      uploadedDocs: {
        pan: { name: "pan.pdf", url: "/pan.pdf" },
      },
      docVerifications: {},
    });

    expect(blockers).toContain(
      'Approve "Submitted Form Data & Information" before advancing.',
    );
    expect(blockers).toContain(
      "Verify all 1 remaining applicant file(s) before advancing.",
    );
    expect(
      canAdvanceWorkflowStatus({
        currentStatus: "UNDER_REVIEW",
        targetStatus: "SUBMITTED",
        formData: { applicantName: "Asha", _formDataApproved: true },
        uploadedDocs: {
          pan: { name: "pan.pdf", url: "/pan.pdf" },
        },
        docVerifications: {
          pan: { status: "VERIFIED" },
        },
      }),
    ).toBe(true);
  });

  it("blocks skipping stages", () => {
    const blockers = getWorkflowBlockers({
      currentStatus: "PAYMENT_CONFIRMED",
      targetStatus: "SUBMITTED",
      formData: { applicantName: "Asha", _formDataApproved: true },
      uploadedDocs: {
        pan: { name: "pan.pdf", url: "/pan.pdf" },
      },
      docVerifications: {
        pan: { status: "VERIFIED" },
      },
    });

    expect(blockers[0]).toContain("Under Verification");
  });
});
