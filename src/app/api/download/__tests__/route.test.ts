import { describe, it, expect } from 'vitest';
import { GET } from '../route';
import { NextRequest } from 'next/server';

describe('GET /api/download API Route', () => {
  it('returns 400 Bad Request when missing url, key, and filename parameters', async () => {
    const req = new NextRequest('http://localhost:3000/api/download');
    const res = await GET(req);

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("Missing required 'url' or 'key' parameter");
  });

  it('generates dev fallback PDF with correct headers when requesting via filename and url or key', async () => {
    const req = new NextRequest('http://localhost:3000/api/download?url=sample.pdf&filename=Test_Filing_Certificate');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('application/pdf');
    expect(res.headers.get('content-disposition')).toBe('attachment; filename="Test_Filing_Certificate.pdf"');

    const textContent = await res.text();
    expect(textContent).toContain('%PDF-1.4');
    expect(textContent).toContain('OFFICIAL FILING CERTIFICATE - Test_Filing_Certificate');
  });

  it('handles custom filenames with spaces and sanitize invalid characters', async () => {
    const req = new NextRequest('http://localhost:3000/api/download?key=doc.pdf&filename=Company<License>_Final?.pdf');
    const res = await GET(req);

    expect(res.status).toBe(200);
    const disposition = res.headers.get('content-disposition');
    expect(disposition).toContain('attachment; filename="Company_License__Final_.pdf"');
  });
});
