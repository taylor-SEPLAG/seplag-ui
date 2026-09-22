import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // 1. Configurações Globais e Ignores
  {
    ignores: ["dist", "node_modules", "build"],
  },

  // 2. Extensões de bases recomendadas
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // 3. Configuração específica do Projeto
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    // Aqui você define as regras e configurações de plugins
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "import/no-default-export": "off",
      quotes: ["error", "double", { avoidEscape: true }],
      eqeqeq: ["error", "always", { null: "ignore" }],
    },
  },
);
