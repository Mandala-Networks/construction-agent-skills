import { runFromCli } from "./scripts/validate-benchmark.ts";

await runFromCli(Bun.argv.slice(2));
