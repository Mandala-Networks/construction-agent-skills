import { readdir, readFile, realpath } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";

const sharedFields = [
  "name",
  "version",
  "description",
  "author",
  "repository",
  "keywords",
];

export function checkMetadata(
  claude: Record<string, unknown>,
  codex: Record<string, unknown>,
  version: string,
): string[] {
  const errors: string[] = [];
  for (const field of sharedFields) {
    if (
      claude[field] === undefined ||
      JSON.stringify(claude[field]) !== JSON.stringify(codex[field])
    ) {
      errors.push(`Plugin metadata mismatch: ${field}`);
    }
  }
  if (claude.version !== version || !/^\d+\.\d+\.\d+$/.test(version))
    errors.push("Invalid or unsynchronized package version");
  if (codex.skills !== "./skills/")
    errors.push("Codex must use the canonical skills directory");
  return errors;
}

export function sensitiveContent(text: string): string[] {
  // Heuristic only: report categories, never echo potentially sensitive matches.
  const rules: [string, RegExp][] = [
    ["private key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
    ["provider token", /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{32,})\b/],
    [
      "credential assignment",
      /(?:api[_-]?key|password|secret|token)\s*[=:]\s*["'][^"'\s]{16,}["']/i,
    ],
    ["personal filesystem path", /(?:\/Users\/|\/home\/|[A-Z]:\\Users\\)[^\s/\\]+/],
    ["signed URL", /https?:\/\/[^\s]+[?&](?:X-Amz-Signature|sig|access_token)=[^\s]+/i],
  ];
  return rules
    .filter(([, pattern]) => pattern.test(text))
    .map(([category]) => category);
}

export async function containedPath(
  root: string,
  from: string,
  target: string,
): Promise<boolean> {
  if (isAbsolute(target)) return false;
  try {
    const actual = await realpath(resolve(dirname(from), target));
    const rel = relative(await realpath(root), actual);
    return rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
  } catch {
    return false;
  }
}

export async function validatePackage(root: string): Promise<string[]> {
  const json = async (path: string) =>
    JSON.parse(await readFile(resolve(root, path), "utf8"));
  const errors = checkMetadata(
    await json(".claude-plugin/plugin.json"),
    await json(".codex-plugin/plugin.json"),
    (await json("package.json")).version,
  );
  const catalog = (await json("catalog.json")) as { skills: { id: string }[] };
  const names = catalog.skills.map((entry) => entry.id);
  const folders = (await readdir(resolve(root, "skills"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  if (
    new Set(names).size !== names.length ||
    [...names].sort().join() !== folders.sort().join()
  )
    errors.push("Catalog and skill directories must match uniquely");
  for (const name of names) {
    const content = await readFile(resolve(root, "skills", name, "SKILL.md"), "utf8");
    if (!content.startsWith(`---\nname: ${name}\ndescription: `))
      errors.push(`Invalid skill identity: ${name}`);
  }
  // Git's candidate inventory includes new files while respecting runtime ignores.
  const proc = Bun.spawnSync(
    ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: root },
  );
  if (proc.exitCode !== 0) throw new Error("Cannot inspect repository candidate files");
  for (const path of proc.stdout.toString().split("\0").filter(Boolean)) {
    const absolute = resolve(root, path);
    if (!(await containedPath(root, resolve(root, "root"), path))) {
      errors.push(`Missing or escaping package path: ${path}`);
      continue;
    }
    const content = await readFile(absolute, "utf8");
    for (const category of sensitiveContent(content))
      errors.push(`${path}: possible ${category}`);
    if (path.endsWith(".md")) {
      for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
        const target = match[1]?.split("#")[0];
        if (!target || /^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
        if (!(await containedPath(root, absolute, target)))
          errors.push(`${path}: broken or escaping relative link`);
      }
    }
  }
  return errors;
}

if (import.meta.main) {
  const errors = await validatePackage(resolve(import.meta.dir, ".."));
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else
    console.log(
      "Plugin metadata, catalog, local links, and sensitive-content heuristics passed.",
    );
}
