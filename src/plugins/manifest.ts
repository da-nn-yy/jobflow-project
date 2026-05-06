export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  entry: string;
  hooks: Array<"before_run" | "after_task" | "on_failure">;
}
