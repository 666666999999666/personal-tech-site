export interface StorageAdapter {
  upload(
    key: string,
    data: Buffer,
    contentType: string
  ): Promise<{ url: string; key: string }>;

  get(key: string): Promise<Buffer>;

  delete(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;
}
