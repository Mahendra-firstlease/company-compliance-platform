import { describe, expect, it } from "vitest";
import { formatMaxFileSize, dropzoneRejectMessage } from "../upload-size-utils";

describe("upload-size-utils", () => {
  it("formats kilobytes and megabytes", () => {
    expect(formatMaxFileSize(50 * 1024)).toBe("50 KB");
    expect(formatMaxFileSize(1024 * 1024)).toBe("1 MB");
    expect(formatMaxFileSize(2.5 * 1024 * 1024)).toBe("2.5 MB");
  });

  it("produces readable reject messages", () => {
    expect(dropzoneRejectMessage("file-too-large", ["pdf"], 2 * 1024 * 1024)).toContain(
      "exceeds the maximum allowed limit of 2 MB",
    );
    expect(dropzoneRejectMessage("file-invalid-type", ["pdf", "jpg"], 1024)).toContain(
      "PDF, JPG",
    );
  });
});

