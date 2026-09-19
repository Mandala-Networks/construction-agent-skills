import { createHash } from "node:crypto";
import { lstat, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { parseFrontmatter, renderAgent } from "./generate-codex-agents";
import { sensitiveContent } from "./validate-package";

export const platforms = [
  "plugin",
  "claude",
  "codex",
  "grok",
  "opencode",
  "openwork",
] as const;
export type Platform = (typeof platforms)[number];

// Export only authored capability content. Never copy arbitrary checkout files.
async function collect(root: string, prefix: string): Promise<Map<string, string>> {
  const files = new Map<string, string>();
  async function walk(path: string) {
    if (
      path
        .split(/[\\/]/)
        .some(
          (part) =>
            part.startsWith(".env") ||
            ["node_modules", "private", ".git"].includes(part),
        )
    ) {
      throw new Error(`Runtime data cannot be exported: ${path}`);
    }
    const stat = await lstat(join(root, path));
    if (stat.isSymbolicLink()) throw new Error(`Symlinks cannot be exported: ${path}`);
    if (stat.isDirectory()) {
      for (const name of (await readdir(join(root, path))).sort())
        await walk(join(path, name));
    } else if (stat.isFile()) {
      // Current capabilities are text-only. Fail rather than corrupt future binary assets.
      const bytes = await readFile(join(root, path));
      const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
      if (sensitiveContent(text).length)
        throw new Error(`Possible sensitive content in ${path}`);
      files.set(path.replaceAll("\\", "/"), text);
    }
  }
  // A manifest's parent directory may itself be a symlink.
  const parts = prefix.split("/");
  for (let i = 1; i < parts.length; i++) {
    if ((await lstat(join(root, ...parts.slice(0, i)))).isSymbolicLink())
      throw new Error(`Symlinks cannot be exported: ${prefix}`);
  }
  await walk(prefix);
  return files;
}

export async function planExport(
  root: string,
  platform: Platform,
): Promise<Map<string, string>> {
  if (!platforms.includes(platform))
    throw new Error(`Unsupported platform: ${platform}`);
  const skills = await collect(root, "skills");
  const agents = await collect(root, "agents");
  const files = new Map<string, string>();
  const prefix =
    platform === "plugin"
      ? ""
      : platform === "codex"
        ? ".agents/"
        : platform === "openwork"
          ? ".opencode/"
          : `.${platform}/`;
  for (const [path, content] of skills) files.set(`${prefix}${path}`, content);
  for (const [path, content] of agents) {
    if (platform === "codex") {
      const rendered = renderAgent(join(root, path), content, "../../.agents/skills/");
      const target = `.codex/agents/${rendered.generatedFile}`;
      if (files.has(target)) throw new Error("Duplicate agent name");
      files.set(target, rendered.content);
    } else if (platform === "opencode" || platform === "openwork") {
      const { name, description, body } = parseFrontmatter(content);
      files.set(
        `${prefix}${path}`,
        `---\nname: ${name}\ndescription: ${JSON.stringify(description)}\nmode: subagent\n---\n${body}`,
      );
    } else files.set(`${prefix}${path}`, content);
  }
  if (platform === "plugin") {
    for (const path of [
      ".claude-plugin/plugin.json",
      ".codex-plugin/plugin.json",
      ".grok-plugin/plugin.json",
      ".grok-plugin/marketplace.json",
      ".claude-plugin/marketplace.json",
      ".agents/plugins/marketplace.json",
    ]) {
      for (const [file, content] of await collect(root, path)) files.set(file, content);
    }
    for (const [path, content] of await collect(root, "commands"))
      files.set(path, content);
  }
  const version = JSON.parse(
    (await collect(root, "package.json")).get("package.json") ?? "{}",
  ).version;
  const hashes = Object.fromEntries(
    [...files].map(([path, content]) => [
      path,
      createHash("sha256").update(content).digest("hex"),
    ]),
  );
  files.set(
    "construction-export.json",
    `${JSON.stringify({ platform, version, files: hashes }, null, 2)}\n`,
  );
  return files;
}

export async function exportWorkspace(
  root: string,
  platform: Platform,
  destination: string,
): Promise<void> {
  // Validate and read everything before writing. Exclusive mkdir prevents overwrites.
  const files = await planExport(root, platform);
  const targets = [...files].map(([path, content]) => {
    const target = resolve(destination, path);
    const rel = relative(resolve(destination), target);
    if (!rel || rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel))
      throw new Error("Export path escapes destination");
    return { target, content };
  });
  await mkdir(destination, { recursive: false });
  for (const { target, content } of targets) {
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content, { flag: "wx" });
  }
}

if (import.meta.main) {
  const [platform, destination] = process.argv.slice(2);
  if (
    !platform ||
    !platforms.includes(platform as Platform) ||
    !destination ||
    process.argv.length !== 4
  ) {
    throw new Error(
      `Usage: bun run export:workspace <${platforms.join("|")}> <new-directory>`,
    );
  }
  await exportWorkspace(
    resolve(import.meta.dir, ".."),
    platform as Platform,
    resolve(destination),
  );
  console.log(
    `Exported ${platform} capability bundle. No global settings or credentials changed.`,
  );
}
