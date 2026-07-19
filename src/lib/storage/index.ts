import type { StorageAdapter } from "./types";
import { LocalFSAdapter } from "./local";

export function createStorageFromEnv(): StorageAdapter {
  const driver = process.env.STORAGE_DRIVER || "local";

  switch (driver) {
    case "local":
      return new LocalFSAdapter();
    default:
      throw new Error(`Unknown STORAGE_DRIVER: "${driver}". Use "local".`);
  }
}

export const storage = createStorageFromEnv();
