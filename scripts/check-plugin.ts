import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

const HOST_MANIFESTS = [
  ".claude-plugin/plugin.json",
  ".codex-plugin/plugin.json",
  ".grok-plugin/plugin.json",
] as const;

const MARKETPLACES = [
  ".claude-plugin/marketplace.json",
  ".grok-plugin/marketplace.json",
  ".agents/plugins/marketplace.json",
] as const;

const SHARED_FIELDS = [
  "name",
  "version",
  "description",
  "author",
  "homepage",
  "repository",
  "keywords",
] as const;

const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

const readJson = async <T>(path: string): Promise<T> =>
  Bun.file(join(ROOT, path)).json() as Promise<T>;

const stable = (value: unknown): string => JSON.stringify(value);

const listSkillDirectories = async (): Promise<string[]> => {
  const glob = new Bun.Glob("*/SKILL.md");
  const names: string[] = [];
  for await (const file of glob.scan({ cwd: join(ROOT, "skills") })) {
    names.push(file.replace("/SKILL.md", ""));
  }
  return names.sort();
};

const frontmatterField = (text: string, field: string): string | null => {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!match) {
    return null;
  }
  const entry = new RegExp(`^${field}:\\s*(.*)$`, "m").exec(match[1] ?? "");
  if (!entry) {
    return null;
  }
  const value = (entry[1] ?? "").trim();
  if (value === ">-" || value === ">" || value === "|" || value === "|-") {
    return "folded";
  }
  return value.replace(/^["']|["']$/g, "");
};

export const collectProblems = async (): Promise<string[]> => {
  const problems: string[] = [];
  const manifests = await Promise.all(
    HOST_MANIFESTS.map(async (path) => ({
      path,
      value: await readJson<Record<string, unknown>>(path),
    })),
  );
  const reference = manifests[0];
  const others = manifests.slice(1);
  if (!reference) {
    return ["no host plugin manifests were found"];
  }

  for (const field of SHARED_FIELDS) {
    for (const other of others) {
      if (stable(other.value[field]) !== stable(reference.value[field])) {
        problems.push(
          `${other.path}: ${field} is ${stable(other.value[field])}, ` +
            `but ${reference.path} has ${stable(reference.value[field])}`,
        );
      }
    }
  }

  const version = String(reference.value.version ?? "");
  if (!SEMVER.test(version)) {
    problems.push(`${reference.path}: version "${version}" is not a stable semver`);
  }

  for (const path of MARKETPLACES) {
    const marketplace = await readJson<{
      plugins: Array<Record<string, unknown>>;
      version?: string;
    }>(path);
    const entry = marketplace.plugins.find(
      (plugin) => plugin.name === reference.value.name,
    );
    if (!entry) {
      problems.push(`${path}: no entry named ${String(reference.value.name)}`);
      continue;
    }
    if (marketplace.version !== undefined && marketplace.version !== version) {
      problems.push(
        `${path}: marketplace version ${marketplace.version} does not match ${version}`,
      );
    }
    if (entry.version !== undefined && entry.version !== version) {
      problems.push(
        `${path}: plugin entry version ${String(entry.version)} != ${version}`,
      );
    }
  }

  const skills = await listSkillDirectories();
  if (skills.length === 0) {
    problems.push("skills/: no skill directories found");
  }
  for (const skill of skills) {
    const path = `skills/${skill}/SKILL.md`;
    const text = await Bun.file(join(ROOT, path)).text();
    const name = frontmatterField(text, "name");
    const description = frontmatterField(text, "description");
    if (name === null) {
      problems.push(`${path}: frontmatter is missing name`);
    } else if (name !== skill && name !== "folded") {
      problems.push(
        `${path}: frontmatter name "${name}" does not match directory "${skill}"`,
      );
    }
    if (description === null) {
      problems.push(`${path}: frontmatter is missing description`);
    }
    if (!/## Boundaries/.test(text)) {
      problems.push(
        `${path}: every construction skill must declare a Boundaries section`,
      );
    }
  }

  const catalog = await readJson<{
    skills: Array<{ benchmark?: string; id: string; status: string }>;
  }>("catalog.json");
  const catalogIds = catalog.skills.map((entry) => entry.id).sort();
  for (const skill of skills) {
    if (!catalogIds.includes(skill)) {
      problems.push(`catalog.json: skills/${skill} is not listed`);
    }
  }
  for (const id of catalogIds) {
    if (!skills.includes(id)) {
      problems.push(`catalog.json: "${id}" has no skills/${id}/SKILL.md`);
    }
  }
  for (const entry of catalog.skills) {
    if (entry.benchmark === undefined) {
      continue;
    }
    if (!(await Bun.file(join(ROOT, entry.benchmark, "benchmark.json")).exists())) {
      problems.push(`catalog.json: ${entry.id} points at missing ${entry.benchmark}`);
    }
  }

  const readme = await Bun.file(join(ROOT, "README.md")).text();
  for (const skill of skills) {
    if (!readme.includes(skill)) {
      problems.push(`README.md: skill "${skill}" is not listed in the inventory`);
    }
  }

  return problems;
};

const bumpPatch = async (): Promise<string> => {
  const reference = await readJson<Record<string, unknown>>(HOST_MANIFESTS[0]);
  const current = String(reference.version ?? "");
  const parts = SEMVER.exec(current);
  if (!parts) {
    throw new Error(`cannot bump non-semver version "${current}"`);
  }
  const next = `${parts[1]}.${parts[2]}.${Number(parts[3]) + 1}`;
  for (const path of HOST_MANIFESTS) {
    const manifest = await readJson<Record<string, unknown>>(path);
    manifest.version = next;
    await Bun.write(join(ROOT, path), `${JSON.stringify(manifest, null, 2)}\n`);
  }
  for (const path of MARKETPLACES) {
    const marketplace = await readJson<{
      plugins: Array<Record<string, unknown>>;
      version?: string;
    }>(path);
    if (marketplace.version !== undefined) {
      marketplace.version = next;
    }
    for (const entry of marketplace.plugins) {
      if (entry.version !== undefined) {
        entry.version = next;
      }
    }
    await Bun.write(join(ROOT, path), `${JSON.stringify(marketplace, null, 2)}\n`);
  }
  const pkg = await readJson<Record<string, unknown>>("package.json");
  pkg.version = next;
  await Bun.write(join(ROOT, "package.json"), `${JSON.stringify(pkg, null, 2)}\n`);
  return next;
};

export const runFromCli = async (args: string[]): Promise<void> => {
  if (args.includes("--bump-patch")) {
    const next = await bumpPatch();
    process.stdout.write(`Bumped every host manifest and marketplace to ${next}\n`);
    return;
  }
  const problems = await collectProblems();
  if (problems.length > 0) {
    process.stderr.write(
      `${problems.length} plugin manifest problem(s):\n${problems
        .map((problem) => `  - ${problem}`)
        .join("\n")}\n`,
    );
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    `Plugin manifests, marketplaces, skills, catalog, and README are consistent ` +
      `(${relative(ROOT, join(ROOT, "skills"))}).\n`,
  );
};

if (import.meta.main) {
  await runFromCli(Bun.argv.slice(2));
}
