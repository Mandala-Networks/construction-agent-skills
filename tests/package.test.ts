import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
