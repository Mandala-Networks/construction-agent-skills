import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportWorkspace, planExport, platforms } from "../scripts/export-workspace";
import { containedPath } from "../scripts/validate-package";

const root = join(import.meta.dir, "..");
const skillNames = (await readdir(join(root, "skills"))).sort();
const agentNames = (await readdir(join(root, "agents")))
  .filter((name) => name.endsWith(".md"))
  .map((name) => name.slice(0, -3))
  .sort();
describe("platform bundles", () => {
  for (const platform of platforms) {
    test(`${platform}: isolated export preserves skills, role links, and content hashes`, async () => {
      const temp = await mkdtemp(join(tmpdir(), "construction-export-"));
      const target = join(temp, "bundle");
      try {
        await exportWorkspace(root, platform, target);
        const manifest = JSON.parse(
          await readFile(join(target, "construction-export.json"), "utf8"),
        ) as { files: Record<string, string> };
        expect(
          Object.keys(manifest.files)
            .filter((p) => p.endsWith("SKILL.md"))
            .map((p) => p.split("/").at(-2))
            .sort(),
        ).toEqual(skillNames);
        expect(
          Object.keys(manifest.files)
            .filter((p) => p.includes("/agents/") || p.startsWith("agents/"))
            .map((p) =>
              p
                .split("/")
                .at(-1)
                ?.replace(/\.(md|toml)$/, ""),
            )
            .sort(),
        ).toEqual(agentNames);
        for (const [path, hash] of Object.entries(manifest.files)) {
          const content = await readFile(join(target, path), "utf8");
          expect(createHash("sha256").update(content).digest("hex")).toBe(hash);
          const text = path.endsWith(".toml")
            ? String(Reflect.get(Bun.TOML.parse(content), "developer_instructions"))
            : content;
          for (const match of text.matchAll(/\]\((\.\.[^)]+)\)/g)) {
            expect(
              await containedPath(target, join(target, path), match[1] ?? ""),
            ).toBe(true);
          }
          if (path.endsWith("SKILL.md")) {
            const canonical = path.slice(path.indexOf("skills/"));
            expect(content).toBe(await readFile(join(root, canonical), "utf8"));
          }
        }
        expect(
          Object.keys(manifest.files).some((p) =>
            /(?:^|\/)(?:\.env|node_modules|benchmarks|private)(?:\/|$)/.test(p),
          ),
        ).toBe(false);
        await expect(exportWorkspace(root, platform, target)).rejects.toThrow();
        expect(
          await readFile(join(target, "construction-export.json"), "utf8"),
        ).toContain('"files"');
      } finally {
        await rm(temp, { recursive: true, force: true });
      }
    });
  }
  test("source symlinks cannot smuggle unrelated files into an export", async () => {
    const temp = await mkdtemp(join(tmpdir(), "construction-link-"));
    try {
      await symlink(join(root, "skills"), join(temp, "skills"));
      await expect(planExport(temp, "plugin")).rejects.toThrow(
        "Symlinks cannot be exported",
      );
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });
  test("runtime input and suspected credentials fail before destination creation", async () => {
    const temp = await mkdtemp(join(tmpdir(), "construction-private-"));
    try {
      await mkdir(join(temp, "skills", "example"), { recursive: true });
      await writeFile(join(temp, "skills", "example", ".env"), "synthetic");
      await expect(planExport(temp, "plugin")).rejects.toThrow(
        "Runtime data cannot be exported",
      );
      await rm(join(temp, "skills", "example", ".env"));
      await writeFile(
        join(temp, "skills", "example", "SKILL.md"),
        `ghp_${"x".repeat(36)}`,
      );
      await expect(planExport(temp, "plugin")).rejects.toThrow(
        "Possible sensitive content",
      );
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });

  test("both marketplaces resolve this plugin at the root", async () => {
    const claude = JSON.parse(
      await readFile(join(root, ".claude-plugin/marketplace.json"), "utf8"),
    );
    const codex = JSON.parse(
      await readFile(join(root, ".agents/plugins/marketplace.json"), "utf8"),
    );
    expect(claude.name).toBe(codex.name);
    expect(claude.plugins).toHaveLength(1);
    expect(codex.plugins).toHaveLength(1);
    expect(claude.plugins[0].source).toBe("./");
    expect(codex.plugins[0].source.path).toBe("./");
    const plugin = JSON.parse(
      await readFile(join(root, ".codex-plugin/plugin.json"), "utf8"),
    );
    expect(claude.plugins[0].name).toBe(plugin.name);
    expect(codex.plugins[0].name).toBe(plugin.name);
  });
});

describe("export regressions", () => {
  async function fixture(temp: string) {
    const source = join(temp, "source");
    for (const dir of [
      "skills",
      "agents",
      "commands",
      ".claude-plugin",
      ".codex-plugin",
      ".grok-plugin",
      ".agents/plugins",
    ])
      await mkdir(join(source, dir), { recursive: true });
    for (const file of [
      ".claude-plugin/plugin.json",
      ".claude-plugin/marketplace.json",
      ".codex-plugin/plugin.json",
      ".grok-plugin/plugin.json",
      ".grok-plugin/marketplace.json",
      ".agents/plugins/marketplace.json",
      "package.json",
    ])
      await writeFile(join(source, file), '{"version":"1.0.0"}');
    return source;
  }
  test("crafted agent names are rejected before any destination is created", async () => {
    const temp = await mkdtemp(join(tmpdir(), "construction-name-"));
    try {
      const source = await fixture(temp);
      for (const name of [
        "../../../outside",
        "../outside",
        "/absolute",
        "..\\outside",
        "valid/name",
      ]) {
        await writeFile(
          join(source, "agents", "example.md"),
          `---\nname: '${name}'\ndescription: Synthetic\n---\nSynthetic role`,
        );
        const target = join(temp, "bundle");
        await expect(exportWorkspace(source, "codex", target)).rejects.toThrow("slug");
        expect((await readdir(temp)).sort()).toEqual(["source"]);
      }
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });
  for (const file of [
    ".claude-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".codex-plugin/plugin.json",
    ".grok-plugin/plugin.json",
    ".grok-plugin/marketplace.json",
    ".agents/plugins/marketplace.json",
    "package.json",
  ]) {
    test(`${file}: symlinks, secrets and invalid text cannot enter plugin exports`, async () => {
      const temp = await mkdtemp(join(tmpdir(), "construction-manifest-"));
      try {
        const source = await fixture(temp);
        const destination = join(temp, "bundle");
        await writeFile(join(temp, "private.txt"), "Synthetic private fixture");
        await rm(join(source, file));
        await symlink(join(temp, "private.txt"), join(source, file));
        await expect(exportWorkspace(source, "plugin", destination)).rejects.toThrow(
          "Symlinks",
        );
        await rm(join(source, file));
        await writeFile(join(source, file), `{"token":"ghp_${"x".repeat(36)}"}`);
        await expect(exportWorkspace(source, "plugin", destination)).rejects.toThrow(
          "sensitive content",
        );
        await writeFile(join(source, file), new Uint8Array([0xff]));
        await expect(exportWorkspace(source, "plugin", destination)).rejects.toThrow();
        expect(await readdir(temp)).not.toContain("bundle");
      } finally {
        await rm(temp, { recursive: true, force: true });
      }
    });
  }
  test("manifest ancestor symlinks are rejected", async () => {
    const temp = await mkdtemp(join(tmpdir(), "construction-parent-link-"));
    try {
      const source = await fixture(temp);
      await rm(join(source, ".claude-plugin"), { recursive: true });
      await symlink(join(root, ".claude-plugin"), join(source, ".claude-plugin"));
      await expect(
        exportWorkspace(source, "plugin", join(temp, "bundle")),
      ).rejects.toThrow("Symlinks");
      expect(await readdir(temp)).not.toContain("bundle");
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });
  test("rich agent frontmatter survives translation without Claude-only runtime settings", async () => {
    const codex = await planExport(root, "codex");
    const rob = Bun.TOML.parse(codex.get(".codex/agents/rob.toml") ?? "");
    expect(Reflect.get(rob, "name")).toBe("rob");
    expect(Reflect.get(rob, "description")).toContain("Construction project delivery");
    for (const platform of ["opencode", "openwork"] as const) {
      const files = await planExport(root, platform);
      const text = files.get(".opencode/agents/rob.md") ?? "";
      const frontmatter = Bun.YAML.parse(
        text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "",
      ) as Record<string, unknown>;
      expect(frontmatter.mode).toBe("subagent");
      expect(frontmatter.model).toBeUndefined();
      expect(frontmatter.tools).toBeUndefined();
      expect(text).toContain("## Standing rules");
    }
  });
});
