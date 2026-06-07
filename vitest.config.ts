import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath } from "node:url";

// Vitest only transforms the test files; the app still builds with Turbopack.
// `vite-tsconfig-paths` resolves the `@/*` alias from tsconfig. `server-only`
// is stubbed so server modules (tools, agentContract) import cleanly here.
export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      "server-only": fileURLToPath(
        new URL("./test/stubs/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
  },
});
