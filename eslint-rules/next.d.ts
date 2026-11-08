declare module "@sarj/eslint-plugin/next" {
  import type { RuleTester } from "oxlint/plugins-dev";

  const plugin: {
    rules: {
      "no-location-assign-relative-destination": Parameters<
        RuleTester["run"]
      >[1];
    };
  };

  export default plugin;
}
