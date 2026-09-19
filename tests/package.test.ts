import { describe, expect, test } from "bun:test";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  checkMetadata,
  containedPath,
  sensitiveContent,
  validatePackage,
} from "../scripts/validate-package.ts";

describe("portable package boundary", () => {
  test("metadata drift and source directory drift fail", () => {
    const shared = {
      name: "example",
      version: "1.0.0",
      description: "Example",
      author: { name: "Example" },
      repository: "https://example.com",
      keywords: [],
    };
    expect(checkMetadata(shared, { ...shared, skills: "./skills/" }, "1.0.0")).toEqual(
      [],
    );
    expect(
      checkMetadata(
        shared,
        { ...shared, version: "1.0.1", skills: "../skills" },
        "1.0.0",
      ),
    ).toHaveLength(2);
  });
  test("sensitive values are detected without echoing them", () => {
    const token = `ghp_${"x".repeat(36)}`;
    const result = sensitiveContent(`credential ${token}`);
    expect(result).toEqual(["provider token"]);
    expect(result.join()).not.toContain(token);
    expect(sensitiveContent("Synthetic example: 4 pages; unknown price.")).toEqual([]);
    expect(sensitiveContent(["/Users", "private-person", "file"].join("/"))).toContain(
      "personal filesystem path",
    );
    expect(sensitiveContent(`api_key="${"a".repeat(20)}"`)).toContain(
      "credential assignment",
    );
    expect(
      sensitiveContent(["https://example.com/file", "sig=synthetic"].join("?")),
    ).toContain("signed URL");
  });
  test("isolated roots reject missing files and outward symlinks", async () => {
    const temp = await mkdtemp(join(tmpdir(), "construction-package-"));
    try {
      const root = join(temp, "plugin");
      await mkdir(root);
      await writeFile(join(root, "inside.md"), "synthetic");
      await writeFile(join(temp, "outside.md"), "synthetic");
      await symlink(join(temp, "outside.md"), join(root, "escape.md"));
      expect(await containedPath(root, join(root, "README.md"), "inside.md")).toBe(
        true,
      );
      expect(await containedPath(root, join(root, "README.md"), "missing.md")).toBe(
        false,
      );
      expect(await containedPath(root, join(root, "README.md"), "../outside.md")).toBe(
        false,
      );
      expect(await containedPath(root, join(root, "README.md"), "escape.md")).toBe(
        false,
      );
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });
  test("the repository passes its package contract", async () => {
    expect(await validatePackage(join(import.meta.dir, ".."))).toEqual([]);
  });
});

test("release bump keeps package and platform versions synchronized", async () => {
  const temp = await mkdtemp(join(tmpdir(), "construction-bump-"));
  const root = join(import.meta.dir, "..");
  const manifests = [
    ".claude-plugin/plugin.json",
    ".codex-plugin/plugin.json",
    ".grok-plugin/plugin.json",
    ".claude-plugin/marketplace.json",
    ".grok-plugin/marketplace.json",
    ".agents/plugins/marketplace.json",
  ];
  try {
    for (const path of [...manifests, "package.json", "scripts/check-plugin.ts"]) {
      await mkdir(dirname(join(temp, path)), { recursive: true });
      await copyFile(join(root, path), join(temp, path));
    }
    const before = JSON.parse(await readFile(join(temp, "package.json"), "utf8"));
    const result = Bun.spawnSync(
      [process.execPath, "scripts/check-plugin.ts", "--bump-patch"],
      { cwd: temp },
    );
    expect(result.exitCode).toBe(0);
    const after = JSON.parse(await readFile(join(temp, "package.json"), "utf8"));
    const parts = before.version.split(".");
    expect(after.version).toBe(`${parts[0]}.${parts[1]}.${Number(parts[2]) + 1}`);
    expect(after.scripts).toEqual(before.scripts);
    for (const path of manifests) {
      const manifest = JSON.parse(await readFile(join(temp, path), "utf8"));
      if (manifest.version) expect(manifest.version).toBe(after.version);
      for (const plugin of manifest.plugins ?? [])
        if (plugin.version) expect(plugin.version).toBe(after.version);
    }
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
