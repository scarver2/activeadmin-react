// vite.dummy.config.js
import { resolve } from "node:path"
import { defineConfig } from "vite"

export default defineConfig({
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "tmp/dummy-assets",
    lib: {
      entry: resolve("spec/dummy/app/javascript/application.js"),
      formats: ["es"],
      fileName: () => "application.js"
    }
  }
})
