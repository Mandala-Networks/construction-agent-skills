import { readdirSync, readFileSync, realpathSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { exportWorkspace } from "./export-workspace";

const root = resolve(import.meta.dir, "..");
const temp = await mkdtemp(join(tmpdir(), "construction-native-"));
const skills = JSON.parse(readFileSync(join(root, "catalog.json"), "utf8")).skills.map(
  (item: { id: string }) => item.id,
);
const agents = readdirSync(join(root, "agents"))
  .filter((file) => file.endsWith(".md"))
  .map((file) => file.slice(0, -3));
const pluginName = JSON.parse(
  readFileSync(join(root, ".claude-plugin/plugin.json"), "utf8"),
).name;
const marketplaceName = JSON.parse(
  readFileSync(join(root, ".claude-plugin/marketplace.json"), "utf8"),
).name;
const selector = `${pluginName}@${marketplaceName}`;
let outputIndex = 0;
function run(args: string[], cwd: string, env: Record<string, string>): string {
  const output = join(temp, `stdout-${outputIndex++}.txt`);
  const result = Bun.spawnSync(args, {
    stdout: Bun.file(output),
    cwd,
    env: { ...process.env, ...env },
    timeout: 30_000,
  });
  if (result.exitCode !== 0)
    throw new Error(
      `${args[0]} ${args[1]} failed; exit ${result.exitCode}. Native smoke test did not pass.`,
    );
  return readFileSync(output, "utf8");
}
function requireNames(actual: string[], expected: string[]) {
  if (expected.some((name) => !actual.includes(name)))
    throw new Error("Native discovery omitted expected capabilities");
}
try {
  const plugin = join(temp, "construction-agent-skills");
  await exportWorkspace(root, "plugin", plugin);
  for (const cli of ["claude", "grok", "opencode"]) {
    if (!Bun.which(cli)) {
      console.log(`${cli}: SKIPPED (not installed)`);
      continue;
    }
    if (cli === "claude") {
      const env = { CLAUDE_CONFIG_DIR: join(temp, "claude-config") };
      run(
        [cli, "plugin", "validate", join(plugin, ".claude-plugin/plugin.json")],
        temp,
        env,
      );
      run([cli, "plugin", "marketplace", "add", plugin], temp, env);
      run([cli, "plugin", "install", selector], temp, env);
      const details = run([cli, "plugin", "details", selector], temp, env);
      if ([...skills, ...agents].some((name) => !details.includes(name)))
        throw new Error("Claude inventory omitted expected capabilities");
    } else if (cli === "grok") {
      const env = {
        GROK_HOME: join(temp, "grok-config"),
        GROK_DISABLE_AUTOUPDATER: "1",
      };
      run([cli, "plugin", "install", plugin, "--trust"], temp, env);
      const data = JSON.parse(run([cli, "inspect", "--json"], temp, env));
      requireNames(
        data.skills.map((item: { name: string }) => item.name),
        skills,
      );
      requireNames(
        data.agents.map((item: { name: string }) =>
          item.name.replace(`${pluginName}:`, ""),
        ),
        agents,
      );
    } else {
      const workspace = join(temp, "opencode-workspace");
      await exportWorkspace(root, "opencode", workspace);
      const env = {
        XDG_DATA_HOME: join(temp, "data"),
        XDG_CONFIG_HOME: join(temp, "config"),
        XDG_CACHE_HOME: join(temp, "cache"),
        XDG_STATE_HOME: join(temp, "state"),
      };
      const data = JSON.parse(run([cli, "--pure", "debug", "skill"], workspace, env));
      requireNames(
        data
          .filter((item: { location: string }) =>
            item.location.startsWith(`${realpathSync(workspace)}/`),
          )
          .map((item: { name: string }) => item.name),
        skills,
      );
      for (const name of agents) {
        const agent = JSON.parse(
          run([cli, "--pure", "debug", "agent", name], workspace, env),
        );
        if (agent.name !== name || agent.mode !== "subagent")
          throw new Error(`OpenCode did not discover ${name} as a subagent`);
      }
    }
    console.log(
      `${cli}: PASS (${skills.length} skills, ${agents.length} roles; no inference)`,
    );
  }
  console.log(
    "Codex: package/TOML tests only. OpenWork: export tests automated; desktop skill discovery verified separately, not by this runner.",
  );
} finally {
  await rm(temp, { recursive: true, force: true });
}
