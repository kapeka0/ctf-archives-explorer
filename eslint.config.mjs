import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import tsParser from "@typescript-eslint/parser";
import nextConfig from "eslint-config-next/core-web-vitals";
import prettierFlat from "eslint-config-prettier/flat";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig([
  // Global ignores
  globalIgnores(["node_modules/", ".next/", "dist/", "public/", "next-env.d.ts"]),

  // Next.js Core Web Vitals (includes jsx-a11y)
  ...nextConfig,

  // TypeScript rules
  {
    files: ["**/*.{ts,tsx}"],
    ignores: ["**/*.d.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
        warnOnUnsupportedTypeScriptVersion: true,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
    },
  },

  // React + hooks
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs["recommended"].rules,
      "react/react-in-jsx-scope": "off",
      // Disable overly strict rules that flag common patterns
      "react-hooks/purity": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXOpeningElement[name.name='a']",
          message: "Do not use <a>. Use Next.js <Link> instead.",
        },
      ],
    },
  },
  // Import restrictions (exclude files that need direct imports)
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["components/ui/**", "i18n/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@radix-ui/*", "!@radix-ui/react-icons"], message: "Import from '@/components/ui' instead." },
            { group: ["next/link"], message: "Import from '@/i18n/routing' instead." },
            { group: ["next/navigation"], message: "Import from '@/i18n/routing' instead." },
          ],
        },
      ],
    },
  },

  // Prettier at the end to override formatting rules
  prettierFlat,
]);
