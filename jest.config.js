const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    ...tsJestTransformCfg,
  },
  // This tells Jest to look for any file with a `.test` or `.spec`
  // extension inside any folder named 'test' or 'tests'.
  testMatch: ['**/test/**/*.+(js|ts|jsx|tsx)', '**/tests/**/*.+(js|ts|jsx|tsx)'],

  // Optional: Set the root directory for Jest to your project's root.
  // This is the default, but it's good practice to include it.
  roots: ['<rootDir>']
};