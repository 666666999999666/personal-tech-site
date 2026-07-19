import fs from "node:fs";
import path from "node:path";
import type { StorageAdapter } from "./types";

const STORAGE_ROOT = process.env.STORAGE_PATH || "./storage";

export class LocalFSAdapter implements StorageAdapter {
  private resolvePath(key: string): string {
    return path.join(STORAGE_ROOT, key);
  }

  async upload(
    key: string,
    data: Buffer,
    _contentType: string
  ): Promise<{ url: string; key: string }> {
    const filePath = this.resolvePath(key);
    const dir = path.dirname(filePath);

    await fs.promises.mkdir(dir, { recursive: true });
    await fs.promises.writeFile(filePath, data);

    const url = `/api/file/${key}`;
    return { url, key };
  }

  async get(key: string): Promise<Buffer> {
    const filePath = this.resolvePath(key);
    return fs.promises.readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);
    await fs.promises.unlink(filePath);
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.resolvePath(key);
    try {
      await fs.promises.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
