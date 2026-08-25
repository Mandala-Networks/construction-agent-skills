import { join, relative } from "node:path";
import { evaluateFile } from "./validate-benchmark.ts";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");

/**
 * Runs every checked-in example submission. The example is the reference
 * answer, so a failure here means a benchmark or the grader drifted, not that
 * a model performed badly.
 */
export const runFromCli = async (): Promise<void> => {
  const glob = new Bun.Glob("*/cases/*/candidate.example.json");
  const paths: string[] = [];
  for await (const file of glob.scan({ cwd: join(ROOT, "benchmarks") })) {
    paths.push(join(ROOT, "benchmarks", file));
  }
  paths.sort();
  if (paths.length === 0) {
    process.stderr.write("No benchmark example submissions were found.\n");
    process.exitCode = 1;
    return;
  }
  let failed = 0;
  for (const path of paths) {
    const result = await evaluateFile(path);
    const status = result.passed ? "pass" : "FAIL";
    if (!result.passed) {
      failed += 1;
    }
    process.stdout.write(
      `${status}  ${result.benchmarkId}/${result.caseId}  ` +
        `score=${result.score}  hallucinations=${result.metrics.hallucinations}  ` +
        `(${relative(ROOT, path)})\n`,
    );
  }
  process.stdout.write(
    `\n${paths.length - failed}/${paths.length} example(s) passed.\n`,
  );
  if (failed > 0) {
    process.exitCode = 1;
  }
};

if (import.meta.main) {
  await runFromCli();
}
