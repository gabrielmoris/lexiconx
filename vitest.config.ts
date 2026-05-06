import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
css: {
postcss: {},
},
plugins: [react()],
test: {
environment: "jsdom",
globals: true,
setupFiles: ["./vitest.setup.ts"],
include: ["**/__tests__/**/*.test.{ts,tsx}"],
coverage: {
provider: "v8",
include: ["**/*.{js,jsx,ts,tsx}"],
exclude: [
"**/*.d.ts",
"**/node_modules/**",
"**/out/**",
"**/.next/**",
"**/*.config.*",
"**/coverage/**",
],
},
},
resolve: {
alias: {
"@": path.resolve(__dirname, "."),
},
},
});
