/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import path, { resolve } from "path";
import { defineConfig } from "vite";
import cssInjectedByJs from "vite-plugin-css-injected-by-js";
import dts from "vite-plugin-dts";
import pkg from "./package.json";

const externalDeps = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
];

const isExternal = (id: string) =>
  externalDeps.some((dep) => id === dep || id.startsWith(`${dep}/`));

const redirectRootPlugin = {
  name: "redirect-root-to-seplagui",
  configureServer(server: import("vite").ViteDevServer) {
    server.middlewares.use((req, res, next) => {
      if (req.url === "/") {
        res.writeHead(302, { Location: "/seplagui/" });
        res.end();
        return;
      }
      next();
    });
  },
};

export default defineConfig(({ command: _command, mode }) => {
  const isAppMode = mode === "app";

  return {
    base: isAppMode ? "/seplagui/" : "./",
    resolve: {
      alias: {
        "@componentes": path.resolve(__dirname, "src/componentes"),
        "@routes": path.resolve(__dirname, "src/routes"),
        "@uteis": path.resolve(__dirname, "src/uteis"),
        "@hooks": path.resolve(__dirname, "src/hooks"),
        "@type": path.resolve(__dirname, "src/type"),
        "@provider": path.resolve(__dirname, "src/provider"),
        "@pages": path.resolve(__dirname, "src/pages"),
        "@features": path.resolve(__dirname, "src/features"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@app": path.resolve(__dirname, "src/app"),
        "@lib": path.resolve(__dirname, "src/lib"),
        "@config": path.resolve(__dirname, "src/config"),
      },
    },
    plugins: isAppMode
      ? [react(), redirectRootPlugin]
      : [redirectRootPlugin,
          react(),
          dts({
            include: [
              "src/componentes",
              "src/routes",
              "src/hooks",
              "src/pages",
              "src/features",
              "src/app",
              "src/lib",
              "src/provider",
              "src/type",
              "src/uteis",
              "src/tokens",
              "src/interfaces",
              "src/index.ts",
            ],
            exclude: [
              "src/App.tsx",
              "src/main.tsx",
              "src/**/*.test.{ts,tsx}",
              "src/**/*.spec.{ts,tsx}",
              "src/test",
            ],
            rollupTypes: false,
            tsconfigPath: "./tsconfig.app.json",
            entryRoot: "src",
          }),
          cssInjectedByJs({ relativeCSSInjection: true }),
        ],
    build: isAppMode
      ? {
          outDir: "dist-app",
          copyPublicDir: true,
          rollupOptions: {
            input: resolve(__dirname, "index.html"),
          },
        }
      : {
          outDir: "dist",
          copyPublicDir: false,
          lib: {
            entry: resolve(__dirname, "src/index.ts"),
            name: "SeplagUi",
            formats: ["es"],
            fileName: (format) => `index.${format}.js`,
          },
          rollupOptions: {
            external: isExternal,
            output: {
              preserveModules: true,
              preserveModulesRoot: path.resolve(__dirname, "src"),
              exports: "named",
              dir: "dist",
              entryFileNames: (chunkInfo) => {
                const name = chunkInfo.name.startsWith("src/")
                  ? chunkInfo.name.slice(4)
                  : chunkInfo.name;
                return `${name}.js`;
              },
              assetFileNames: "assets/[name][ext]",
              globals: {
                react: "React",
                "react-dom": "ReactDOM",
              },
            },
          },
          emptyOutDir: true,
          chunkSizeWarningLimit: 1000,
        },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      restoreMocks: true,
      include: ["src/**/*.{test,spec}.{ts,tsx}"],
      coverage: {
        provider: "v8",
        reporter: ["text", "html"],
        include: ["src/componentes/**/*.{ts,tsx}"],
        // Não excluir "**/index.ts": o glob também casa com `index.tsx` e derrubaria o
        // arquivo principal de quase todos os componentes do relatório.
        exclude: ["**/*.test.{ts,tsx}", "src/docs/**"],
      },
    },
  };
});
