import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

import deepmerge from "deepmerge";
import { z } from "zod";

const require = createRequire(import.meta.url);
const umd: unknown = require("deepmerge/dist/umd.js");
z.instanceof(Function).parse(umd);
const implementations: { name: string; merge: typeof deepmerge }[] = [
  { name: "CommonJS", merge: deepmerge },
  { name: "UMD", merge: umd as typeof deepmerge },
];

type JsonObject = Record<string, unknown>;
const objectBoundary = z.record(z.string(), z.unknown());

function parseObject(text: string): JsonObject {
  const value: unknown = JSON.parse(text);
  objectBoundary.parse(value);
  return value as JsonObject;
}

function nullPrototype(): JsonObject {
  const value: JsonObject = {};
  Object.setPrototypeOf(value, null);
  return value;
}

for (const { name, merge } of implementations) {
  const attacks: [string, () => JsonObject, string][] = [
    ["null-prototype target", nullPrototype, '{"__proto__":{"isAdmin":true}}'],
    [
      "null nested target",
      () => ({ session: null }),
      '{"session":{"__proto__":{"isAdmin":true}}}',
    ],
    [
      "primitive nested target",
      () => ({ session: 1 }),
      '{"session":{"__proto__":{"isAdmin":true}}}',
    ],
    [
      "own target key",
      () => parseObject('{"__proto__":{"isAdmin":true}}'),
      "{}",
    ],
    [
      "own source and target keys",
      () => parseObject('{"__proto__":{}}'),
      '{"__proto__":{"isAdmin":true}}',
    ],
  ];

  for (const [shape, makeTarget, input] of attacks) {
    await test(`${name}: ${shape} preserves the result prototype`, () => {
      const result = merge(makeTarget(), parseObject(input));
      const object = Object.hasOwn(result, "session") ? result.session : result;
      objectBoundary.parse(object);
      assert.equal(
        Object.getPrototypeOf(object as JsonObject),
        Object.prototype,
      );
      assert.equal((object as JsonObject).isAdmin, undefined);
      assert.equal(Object.hasOwn(object as JsonObject, "isAdmin"), false);
      const clean: JsonObject = {};
      assert.equal(clean.isAdmin, undefined);
    });
  }

  await test(`${name}: normal nested data, arrays and symbols still merge`, () => {
    const marker = Symbol("marker");
    const source = { nested: { second: 2 }, list: [2], [marker]: { value: 3 } };
    const target = { nested: { first: 1 }, list: [1] };
    const result = merge<Record<PropertyKey, unknown>>(target, source);
    assert.deepEqual(result.nested, { first: 1, second: 2 });
    assert.deepEqual(result.list, [1, 2]);
    assert.deepEqual(result[marker], { value: 3 });
    assert.notEqual(result[marker], source[marker]);
    assert.deepEqual(target, { nested: { first: 1 }, list: [1] });
    assert.deepEqual(merge.all([{ a: 1 }, { b: 2 }]), { a: 1, b: 2 });
  });

  await test(`${name}: custom merges and clone:false retain their contract`, () => {
    const nested = { value: 1 };
    assert.equal(merge({}, { nested }, { clone: false }).nested, nested);
    assert.deepEqual(
      merge(
        { list: [1] },
        { list: [2] },
        { arrayMerge: (_target: unknown[], source: unknown[]) => source },
      ),
      { list: [2] },
    );
    assert.deepEqual(
      merge(
        { nested: { first: 1 } },
        { nested: { second: 2 } },
        {
          customMerge: (key) =>
            key === "nested"
              ? (_target: unknown, source: unknown) => source
              : undefined,
        },
      ),
      { nested: { second: 2 } },
    );
  });
}
