import { FlatCompat } from "@eslint/eslintrc";
import { defineConfig } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default defineConfig([
  {
    ignores: [
      ".next/",
      "node_modules/",
      "public/",
      "types/",
      "app/(payload)/**",
      "collections/**",
      "payload.config.ts",
      "payload-types.ts",
      "app/my-route/**"
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...compat.extends("prettier"), // 3. Custom Rules & Import Ordering
  {
    name: "project/custom-rules",
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Accessibility & React Overrides
      "react/no-unescaped-entities": "off",
      "react/no-children-prop": "off",
      "@next/next/no-page-custom-font": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "jsx-a11y/alt-text": "off",

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          vars: "all",
          varsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // Enforce Absolute Imports (using @/ alias)
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "**/*",
              from: "./*",
              message:
                "Avoid using relative './' imports. Use absolute '@/' instead.",
            },
          ],
        },
      ],

      // Standardized Import Order
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            ["parent", "sibling"],
            "index",
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/**",
              group: "internal",
            },
          ],
          pathGroupsExcludedImportTypes: ["react", "next"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
  },
  {
    // Payload helpers/scripts need root-level generated types and config. The
    // restricted-paths zone rejects those files even when imported via aliases.
    files: ["lib/calendar/**/*.ts", "scripts/**/*.ts", "tests/**/*.ts"],
    rules: {
      "import/no-restricted-paths": "off",
    },
  },
  {
    files: ["./app/studio/**/*.tsx"],
    rules: {
      "import/no-restricted-paths": "off",
    },
  },
]);
