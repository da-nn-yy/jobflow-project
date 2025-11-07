import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export class FileSnapshotStore<T> {
  constructor(private readonly path: string) {}

  async save(state: T): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(resolve(this.path), JSON.stringify(state, null, 2), "utf8");
  }

  async load(): Promise<T | undefined> {
    try {
      const raw = await readFile(resolve(this.path), "utf8");
      return JSON.parse(raw) as T;
    } catch {
      return undefined;
    }
  }
}
