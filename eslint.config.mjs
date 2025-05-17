import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Extending base config for Next.js and TypeScript
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Adding custom rules section
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // Disables the no-explicit-any rule
      '@typescript-eslint/no-unused-vars': 'off', // Disable the unused-vars rule globally
    },
  },
];

export default eslintConfig;
