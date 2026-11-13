import { execFileSync } from "node:child_process";
import { hash } from "node:crypto";
import { lstat, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import { z } from "zod";

const LanguageSchema = z.enum(["actions", "javascript-typescript", "python"]);
export type Language = z.infer<typeof LanguageSchema>;
const NotificationSchema = z.object({
  level: z.enum(["error", "warning", "note", "none"]).default("warning"),
});
const InvocationSchema = z.object({
  executionSuccessful: z.boolean(),
  toolExecutionNotifications: z.array(NotificationSchema).default([]),
  toolConfigurationNotifications: z.array(NotificationSchema).default([]),
});
const EngineVersionSchema = z.string().trim().min(1);
const DriverSchema = z.object({
  name: z.literal("CodeQL"),
  semanticVersion: EngineVersionSchema.optional(),
  version: EngineVersionSchema.optional(),
  rules: z.array(z.unknown()).min(1),
});
const RunSchema = z.object({
  tool: z.object({ driver: DriverSchema }),
  automationDetails: z.object({ id: z.string() }),
  invocations: z.array(InvocationSchema).min(1),
  results: z.array(
    z.object({ suppressions: z.array(z.unknown()).default([]) }),
  ),
});
const SarifSchema = z.object({
  version: z.literal("2.1.0"),
  runs: z.tuple([RunSchema]),
});
export const CollectionStateSchema = z.object({
  status: z.enum(["unknown", "collected", "findings"]),
  collectionComplete: z.boolean(),
  collectionOnly: z.literal(true),
  isProofOfControlEffectiveness: z.literal(false),
  sourceSha: z.string().regex(/^[0-9a-f]{40}$/),
  language: LanguageSchema,
});

export function evaluate(value: unknown, language: Language) {
  const run = SarifSchema.parse(value).runs[0];
  const driver = run.tool.driver;
  const engineVersion = EngineVersionSchema.parse(
    driver.semanticVersion ?? driver.version,
  );
  if (run.automationDetails.id !== `current-source/${language}/`) {
    throw new Error("Wrong language category");
  }
  verifyInvocations(run.invocations);
  if (run.results.some((entry) => entry.suppressions.length > 0)) {
    throw new Error("Suppressed records cannot establish complete evidence");
  }
  return {
    findings: run.results.length,
    engineVersion,
    ruleCount: driver.rules.length,
  };
}

function verifyInvocations(invocations: z.infer<typeof InvocationSchema>[]) {
  for (const invocation of invocations) {
    if (!invocation.executionSuccessful)
      throw new Error("Native analysis failed");
    const diagnostics = [
      ...invocation.toolExecutionNotifications,
      ...invocation.toolConfigurationNotifications,
    ];
    if (
      diagnostics.some(({ level }) => level === "error" || level === "warning")
    ) {
      throw new Error("Native analysis has unresolved diagnostics");
    }
  }
}

export async function main(args: string[]) {
  const { values, positionals } = parseArgs({
    args,
    allowPositionals: true,
    options: {
      language: { type: "string" },
      output: { type: "string" },
      directory: { type: "string" },
      "analysis-outcome": { type: "string" },
    },
  });
  const selected = LanguageSchema.parse(values.language);
  if (!values.output) throw new Error("An evidence output path is required");
  const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  const initial = {
    ...CollectionStateSchema.parse({
      status: "unknown",
      collectionComplete: false,
      collectionOnly: true,
      isProofOfControlEffectiveness: false,
      sourceSha,
      language: selected,
    }),
    reason: "The native analysis has not completed",
  };
  await writeFile(values.output, `${JSON.stringify(initial, null, 2)}\n`);
  if (positionals.length !== 1)
    throw new Error("Expected initialize or verify");
  if (positionals[0] === "initialize") return;
  try {
    if (
      positionals[0] !== "verify" ||
      values["analysis-outcome"] !== "success"
    ) {
      throw new Error("Native analysis did not succeed");
    }
    if (!values.directory) throw new Error("Missing native SARIF directory");
    execFileSync("git", ["diff", "--exit-code", "HEAD", "--"], {
      stdio: "pipe",
    });
    const entries = await readdir(values.directory);
    const files = entries.filter((name) => name.endsWith(".sarif"));
    if (files.length !== 1 || !files[0])
      throw new Error("Missing or ambiguous native SARIF");
    const file = path.join(values.directory, files[0]);
    const metadata = await lstat(file);
    if (
      !metadata.isFile() ||
      metadata.isSymbolicLink() ||
      metadata.size > 32 * 1024 * 1024
    ) {
      throw new Error("SARIF is not a bounded regular evidence file");
    }
    const bytes = await readFile(file);
    const raw: unknown = JSON.parse(bytes.toString("utf8"));
    const evaluation = evaluate(raw, selected);
    const report = {
      ...initial,
      status: evaluation.findings ? "findings" : "collected",
      collectionComplete: true,
      ...evaluation,
      reason: null,
      sourceBinding:
        "Actual unchanged runner Git checkout and pinned native analyzer",
      sarifSha256: hash("sha256", bytes),
      defaultSetupModified: false,
    };
    await writeFile(values.output, `${JSON.stringify(report, null, 2)}\n`);
    if (evaluation.findings) process.exitCode = 1;
  } catch (error) {
    const reason =
      error instanceof Error ? error.message : "Unknown collection failure";
    await writeFile(
      values.output,
      `${JSON.stringify({ ...initial, reason }, null, 2)}\n`,
    );
    throw error;
  }
}

const entrypoint = process.argv[1];
if (entrypoint && pathToFileURL(entrypoint).href === import.meta.url) {
  await main(process.argv.slice(2));
}
