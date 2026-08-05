import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile } from '../download';

describe('downloadFile Utility', () => {
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let mockAnchor: HTMLAnchorElement;

  beforeEach(() => {
    mockAnchor = document.createElement('a');
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'a') return mockAnchor;
      return document.createElement(tagName);
    });
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    removeChildSpy = vi.spyOn(mockAnchor, 'remove').mockImplementation(() => {});
    vi.spyOn(mockAnchor, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('does nothing if URL is empty', () => {
    downloadFile('');
    expect(appendChildSpy).not.toHaveBeenCalled();
  });

  it('handles base64 data URLs directly on client', () => {
    const dataUrl = 'data:application/pdf;base64,JVBERi0xLjQK...';
    downloadFile(dataUrl, 'certificate.pdf');

    expect(mockAnchor.href).toBe(dataUrl);
    expect(mockAnchor.download).toBe('certificate.pdf');
    expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });

  it('routes standard HTTP URLs through the /api/download proxy', () => {
    const fileUrl = 'https://example.com/files/license.pdf';
    downloadFile(fileUrl, 'License.pdf');

    const expectedProxyUrl = `/api/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent('License.pdf')}`;
    expect(mockAnchor.href).toContain(expectedProxyUrl);
    expect(mockAnchor.download).toBe('License.pdf');
    expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(removeChildSpy).toHaveBeenCalled();
  });
});
