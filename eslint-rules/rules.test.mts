import { describe, it } from "node:test";

import nextNavigation from "@sarj/eslint-plugin/next";
import { RuleTester } from "oxlint/plugins-dev";

import plugin from "./index.mjs";

RuleTester.describe = (name, callback) => {
  describe(name, callback).catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
};
RuleTester.it = (name, callback) => {
  it(name, callback).catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
};

const tester = new RuleTester({
  languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
});

const ui = (names: string, body: string) =>
  `import { ${names} } from "@/components/ui/example"; const view = ${body};`;

const rules = plugin.rules as Record<string, Parameters<RuleTester["run"]>[1]>;

const cases = {
  "no-raw-color": ['<div className="bg-red-500" />', "rawPalette"],
  "no-arbitrary-scale": ['<div className="gap-[13px]" />', "spacing"],
  "no-shadow": ['<div className="shadow-md" />', "shadow"],
  "z-index-tokens": ['<div className="z-50" />', "rawZIndex"],
  "use-ui-primitives": ["<button />", "rawElement"],
  "no-primitive-override": [
    ui("Button", '<Button className="h-10" />'),
    "geometry",
  ],
  "icon-source": ['import { X } from "lucide-react";', "bannedIconLibrary"],
  "motion-tokens": ['<div className="duration-500" />', "duration"],
  "motion-reduce": ['<div className="transition-opacity" />', "missing"],
  "no-layout-animation": [
    '<div className="transition-all" />',
    "transitionAll",
  ],
  "type-scale": ['<div className="font-bold" />', "weight"],
  "no-scrollbar-style": ['<div className="scrollbar-thin" />', "scrollbar"],
  "icon-button-label": [
    ui("Button", '<Button size="icon"><X /></Button>'),
    "unnamed",
  ],
  "surface-width": [
    ui("DialogContent", '<DialogContent className="sm:max-w-xl" />'),
    "offScale",
  ],
  "one-overlay": [
    ui("DialogContent, Sheet", "<DialogContent><Sheet /></DialogContent>"),
    "stacked",
  ],
  "dialog-shape": [
    ui("DialogContent, Tabs", "<DialogContent><Tabs /></DialogContent>"),
    "banned",
  ],
  "footer-actions": [ui("Button", "<Button>Done</Button>"), "deadLabel"],
  "no-header-icon": [
    ui("DialogHeader", "<DialogHeader><WarningIcon /></DialogHeader>"),
    "headerIcon",
  ],
  "destructive-variant": [
    ui("Button", '<Button variant="destructive">Save</Button>'),
    "notDestroying",
  ],
  "select-position": [ui("SelectContent", "<SelectContent />"), "position"],
  "form-labels": [
    ui("Label", '<Label className="text-muted-foreground" />'),
    "muted",
  ],
  "table-shape": [
    ui("TableHead", '<TableHead className="text-muted-foreground" />'),
    "mutedHead",
  ],
  "empty-state": [ui("Empty", "<Empty />"), "noTitle"],
  "shared-blocks": [
    'import { Pagination } from "@/components/ui/pagination";',
    "replaced",
  ],
  "no-nested-card": [ui("Card", "<Card><Card /></Card>"), "nested"],
  "copy-conventions": ["<h2>Are you sure?</h2>", "areYouSure"],
  "sentence-case": ["<h2>Create Persona</h2>", "titleCase"],
};

for (const [name, [code, messageId]] of Object.entries(cases)) {
  tester.run(name, rules[name], {
    valid: [
      {
        code: '<div className="text-foreground gap-4" />',
        filename: "fixture.tsx",
      },
    ],
    invalid: [{ code, filename: "fixture.tsx", errors: [{ messageId }] }],
  });
}

tester.run("import identity and ancestry", rules["no-nested-card"], {
  valid: [
    {
      code: "const Card = () => null; const view = <Card><Card /></Card>;",
      filename: "fixture.tsx",
    },
  ],
  invalid: [
    {
      code: 'import { Card as Panel } from "@/components/ui/card"; const view = <Panel>{rows.map(row => <Panel key={row.id} />)}</Panel>;',
      filename: "fixture.tsx",
      errors: [{ messageId: "nested" }],
    },
  ],
});

tester.run("typed template classes", rules["no-raw-color"], {
  valid: [
    {
      code: `const view: unknown = <div className={\`text-foreground \${active ? "bg-primary" : "bg-muted"}\`} />;`,
      filename: "fixture.tsx",
    },
  ],
  invalid: [
    {
      code: `const view: unknown = <div className={\`p-4 \${active ? "bg-red-500" : "bg-muted"}\`} />;`,
      filename: "fixture.tsx",
      errors: [{ messageId: "rawPalette" }],
    },
  ],
});

const browserTester = new RuleTester({
  languageOptions: {
    globals: {
      location: "readonly",
      window: "readonly",
      globalThis: "readonly",
      document: "readonly",
      self: "readonly",
    },
  },
});

browserTester.run(
  "Next internal navigation",
  nextNavigation.rules["no-location-assign-relative-destination"],
  {
    valid: [
      'location.assign("https://example.com/path");',
      'location.assign("https" + "://example.com");',
      `const host = "https://example.com"; location.assign(\`\${host}/path\`);`,
      'window.location.href = "//example.com/path";',
      'function navigate(location) { location.assign("/internal"); }',
      'const window = { location: { assign() {} } }; window.location.assign("/internal");',
      "location.assign(destination);",
      'let path = "/internal"; path = "https://example.com"; location.assign(path);',
      'const path = "https://example.com"; location.assign(path);',
      "location.assign(...destinations);",
      "const path = path; location.assign(path);",
    ],
    invalid: [
      'location.assign("/internal");',
      'window.location["assign"]("/internal");',
      'globalThis.location.href = "/internal";',
      'document.location.href = "/internal";',
      `self.location.assign(\`/internal/\${id}\`);`,
      'const path = "/internal"; location.assign(path);',
      'let path = "https://example.com"; path = "/internal"; location.assign(path);',
      'location.href = "/internal/" + id;',
    ].map((code) => ({ code, errors: [{ messageId: "noLocationAssign" }] })),
  },
);
