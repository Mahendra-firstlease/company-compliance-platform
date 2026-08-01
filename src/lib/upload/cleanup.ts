import fs from "fs/promises";

/**
 * Remove local disk file if database insertion fails (prevents orphaned files).
 */
export async function cleanupUploadedFile(filePath: string): Promise<void> {
  try {
    if (filePath && (await fs.stat(filePath).catch(() => null))) {
      await fs.unlink(filePath);
      console.log(`[CLEANUP SUCCESS]: Removed orphaned file ${filePath}`);
    }
  } catch (err) {
    console.warn("[CLEANUP WARNING]: Failed to remove file during rollback:", err);
  }
}
