import { describe, it, expect, beforeEach } from "vitest";
import { GET } from "../[...path]/route";
import { NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

describe("GET /storage/[...path] Route Handler", () => {
  const testDir = path.join(process.cwd(), "storage", "test-fixtures");
  const testPng = path.join(testDir, "sample.png");

  beforeEach(async () => {
    await fs.mkdir(testDir, { recursive: true });
    await fs.writeFile(testPng, Buffer.from("fake-png-content"));
  });

  it("serves an image file with correct Content-Type and inline disposition", async () => {
    const req = new NextRequest("http://localhost:3000/storage/test-fixtures/sample.png");
    const params = Promise.resolve({ path: ["test-fixtures", "sample.png"] });

    const res = await GET(req, { params });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("image/png");
    expect(res.headers.get("content-disposition")).toBe('inline; filename="sample.png"');

    const text = await res.text();
    expect(text).toBe("fake-png-content");
  });

  it("returns 404 for non-existent files", async () => {
    const req = new NextRequest("http://localhost:3000/storage/test-fixtures/missing.png");
    const params = Promise.resolve({ path: ["test-fixtures", "missing.png"] });

    const res = await GET(req, { params });
    expect(res.status).toBe(404);
  });

  it("blocks directory traversal attacks returning 403 or 404", async () => {
    const req = new NextRequest("http://localhost:3000/storage/../../package.json");
    const params = Promise.resolve({ path: ["..", "..", "package.json"] });

    const res = await GET(req, { params });
    expect([403, 404]).toContain(res.status);
  });
});

