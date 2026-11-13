import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { CollectionStateSchema, evaluate, main } from "./codeql-evidence.mts";

interface NativeRun {
  tool: {
    driver: { name: string; semanticVersion: string; rules: { id: string }[] };
    extensions: { name: string; rules: { id: string }[] }[];
  };
  automationDetails: { id: string };
  invocations: [
    {
      executionSuccessful: boolean;
      toolExecutionNotifications: Record<string, unknown>[];
    },
  ];
  results: Record<string, unknown>[];
}

function native(): { version: string; runs: [NativeRun] } {
  return {
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "CodeQL",
            semanticVersion: "2.27.4",
            rules: [],
          },
          extensions: [
            { name: "codeql/python-queries", rules: [{ id: "py/synthetic" }] },
          ],
        },
        automationDetails: { id: "current-source/python/" },
        invocations: [
          { executionSuccessful: true, toolExecutionNotifications: [] },
        ],
        results: [],
      },
    ],
  };
}

await test("complete native collection remains separate from control effectiveness", () => {
  assert.deepEqual(evaluate(native(), "python"), {
    findings: 0,
    engineVersion: "2.27.4",
    ruleCount: 1,
    queryPack: "codeql/python-queries",
    fullSourceAnalysis: true,
  });
});

await test("all native finding records are counted", () => {
  const value = native();
  value.runs[0].results.push(
    { level: "note" },
    { level: "warning" },
    { level: "error" },
  );
  assert.equal(evaluate(value, "python").findings, 3);
});

for (const failure of [
  "missing-results",
  "failed",
  "warning",
  "wrong-language",
  "suppressed",
  "empty-rules",
  "missing-query-pack",
  "wrong-query-pack",
  "duplicate-query-pack",
  "diff-informed",
  "duplicate-rule",
  "no-version",
  "missing-invocations",
  "missing-version",
]) {
  await test(`native ${failure} cannot become successful collection`, () => {
    const value = native();
    const run = value.runs[0];
    if (failure === "missing-results") Reflect.deleteProperty(run, "results");
    if (failure === "failed") run.invocations[0].executionSuccessful = false;
    if (failure === "warning")
      Reflect.set(run.invocations[0], "toolExecutionNotifications", [
        { level: "warning" },
      ]);
    if (failure === "wrong-language")
      run.automationDetails.id = "current-source/actions/";
    if (failure === "suppressed")
      run.results.push({ suppressions: [{ kind: "external" }] });
    if (failure === "empty-rules")
      run.tool.extensions = [{ name: "codeql/python-queries", rules: [] }];
    if (failure === "missing-query-pack") run.tool.extensions = [];
    if (failure === "wrong-query-pack")
      run.tool.extensions = [
        {
          name: "codeql/actions-queries",
          rules: [{ id: "actions/synthetic" }],
        },
      ];
    if (failure === "duplicate-query-pack")
      run.tool.extensions.push(...run.tool.extensions);
    if (failure === "diff-informed")
      run.tool.extensions.push({
        name: "codeql-action/pr-diff-range",
        rules: [],
      });
    if (failure === "duplicate-rule")
      run.tool.extensions = [
        {
          name: "codeql/python-queries",
          rules: [{ id: "py/synthetic" }, { id: "py/synthetic" }],
        },
      ];
    if (failure === "no-version")
      Reflect.deleteProperty(run.tool.driver, "semanticVersion");
    if (failure === "missing-invocations")
      Reflect.deleteProperty(run, "invocations");
    if (failure === "missing-version") Reflect.deleteProperty(value, "version");
    assert.throws(() => evaluate(value, "python"));
  });
}

await test("a failed analyzer overwrites stale successful evidence", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "codeql-evidence-"));
  const output = path.join(directory, "evaluation.json");
  try {
    await writeFile(output, '{"status":"collected"}\n');
    await assert.rejects(
      main([
        "verify",
        "--language",
        "python",
        "--output",
        output,
        "--directory",
        directory,
        "--analysis-outcome",
        "failure",
      ]),
      /did not succeed/,
    );
    const report: unknown = JSON.parse(await readFile(output, "utf8"));
    const state = CollectionStateSchema.parse(report);
    assert.equal(state.status, "unknown");
    assert.match(JSON.stringify(report), /"status":"unknown"/);
    assert.match(
      JSON.stringify(report),
      /"isProofOfControlEffectiveness":false/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
