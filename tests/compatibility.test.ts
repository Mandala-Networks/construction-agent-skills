import { describe, expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { exportWorkspace, planExport, platforms } from "../scripts/export-workspace";
import { containedPath } from "../scripts/validate-package";

const root = join(import.meta.dir, "..");
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
          Object.keys(manifest.files).filter((p) => p.endsWith("SKILL.md")),
        ).toHaveLength(6);
        expect(
          Object.keys(manifest.files).filter(
            (p) => p.includes("/agents/") || p.startsWith("agents/"),
          ),
        ).toHaveLength(4);
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
