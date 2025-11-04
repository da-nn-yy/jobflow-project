import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

export interface JournalEntry {
  seq: number;
  type: string;
  payload: Record<string, unknown>;
  at: string;
}

export class FileJournal {
  private seq = 0;

  constructor(private readonly path: string) {}

  async append(type: string, payload: Record<string, unknown>): Promise<JournalEntry> {
    await mkdir(dirname(this.path), { recursive: true });
    const entry: JournalEntry = {
      seq: ++this.seq,
      type,
      payload,
      at: new Date().toISOString(),
    };
    await appendFile(this.path, JSON.stringify(entry) + "\n", "utf8");
    return entry;
  }

  async readAll(): Promise<JournalEntry[]> {
    try {
      const raw = await readFile(resolve(this.path), "utf8");
      return raw
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line) as JournalEntry);
    } catch {
      return [];
    }
  }
}
