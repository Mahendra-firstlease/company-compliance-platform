import React from "react";
import { render, screen, cleanup } from "@testing-library/react";
import { describe, it, expect, afterEach } from "vitest";
import FieldValue from "../FieldValue";

describe("FieldValue Component", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders null as N/A", () => {
    render(<FieldValue value={null} />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders empty string as N/A", () => {
    render(<FieldValue value="" />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders boolean values correctly", () => {
    const { unmount } = render(<FieldValue value={true} />);
    expect(screen.getByText("Yes")).toBeInTheDocument();
    unmount();

    render(<FieldValue value={false} />);
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  it("renders string primitives", () => {
    render(<FieldValue value="MSG Private Limited" />);
    expect(screen.getByText("MSG Private Limited")).toBeInTheDocument();
  });

  it("renders single document objects as download buttons", () => {
    const doc = {
      name: "sample_pan.pdf",
      url: "https://example.com/sample_pan.pdf",
      size: "0.2 MB",
    };
    render(<FieldValue value={doc} />);
    expect(screen.getByText("sample_pan.pdf")).toBeInTheDocument();
    expect(screen.getByText("(0.2 MB)")).toBeInTheDocument();
  });

  it("renders document collections / uploadedDocs maps cleanly without dumping JSON", () => {
    const uploadedDocs = {
      panDocument: {
        name: "pan_card.jpg",
        size: "0.17 MB",
        type: "JPEG",
        url: "https://example.com/pan.jpg",
      },
      "aadhaarDocument (Front)": {
        name: "aadhaar_front.jpg",
        size: "0.03 MB",
        type: "JPEG",
        url: "https://example.com/aadhaar_f.jpg",
      },
    };

    const { container } = render(<FieldValue value={uploadedDocs} />);

    // Should NOT contain raw JSON stringify curly brackets or raw json dump
    expect(container.textContent).not.toContain('{"panDocument":');
    expect(container.textContent).not.toContain('"url":');

    // Should contain formatted titles and file names
    expect(screen.getByText("Pan Document:")).toBeInTheDocument();
    expect(screen.getByText("pan_card.jpg")).toBeInTheDocument();
    expect(screen.getByText("Aadhaar Document ( Front):")).toBeInTheDocument();
    expect(screen.getByText("aadhaar_front.jpg")).toBeInTheDocument();
  });

  it("renders front-back document scans properly", () => {
    const scan = {
      frontUrl: "https://example.com/front.pdf",
      backUrl: "https://example.com/back.pdf",
    };
    render(<FieldValue value={scan} />);
    expect(screen.getByText("Front Scan")).toBeInTheDocument();
    expect(screen.getByText("Back Scan")).toBeInTheDocument();
  });

  it("renders generic objects as key-value badges rather than raw JSON", () => {
    const customObj = {
      category: "Manufacturing",
      zone: "Industrial",
    };
    const { container } = render(<FieldValue value={customObj} />);
    expect(container.textContent).not.toContain('{"category":');
    expect(screen.getByText("Category:")).toBeInTheDocument();
    expect(screen.getByText("Manufacturing")).toBeInTheDocument();
    expect(screen.getByText("Zone:")).toBeInTheDocument();
    expect(screen.getByText("Industrial")).toBeInTheDocument();
  });
});

