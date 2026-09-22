import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * Config ESLint padrão Seplag — importe e espalhe nos projetos:
 *
 *   import seplagConfig from "@seplag/ui-lib-react-18/eslint-config"
 *   export default [...seplagConfig, { rules: { ... } }]
 */
const seplagEslintConfig = [
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      "react-hooks": pluginReactHooks,
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    rules: {
      "react/jsx-uses-react": "off",
      "react/react-in-jsx-scope": "off",

      "@typescript-eslint/no-unused-vars": ["error"],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],

      quotes: ["error", "double", { avoidEscape: true }],
      eqeqeq: ["error", "always"],

      "no-console": ["warn", { allow: ["warn", "error"] }],

      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      "no-restricted-syntax": [
        "error",
        {
          selector: "ExpressionStatement > Literal[value='use client']",
          message:
            "A diretiva 'use client' não é permitida neste projeto. Mantenha os componentes como Server Components.",
        },
      ],
    },
  },
  {
    ignores: ["eslint.config.js", "eslint-config.js"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "CallExpression[callee.name='useEffect'] CallExpression[callee.name='printToast']",
          message:
            "Evite usar printToast dentro de useEffect. Prefira os callbacks da chamada ao backend: onSuccess, onError ou onSettled (ex: useMutation({ onSuccess: () => printToast(...) })).",
        },
        {
          selector: "ExportDefaultDeclaration",
          message:
            "Prefira named exports. Export default dificulta refatorações e buscas no código.",
        },
      ],
    },
  },
];

export default seplagEslintConfig;
