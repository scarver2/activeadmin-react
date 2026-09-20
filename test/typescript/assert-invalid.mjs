// test/typescript/assert-invalid.mjs

import { spawnSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

const fixture = fileURLToPath(new URL("./invalid.ts", import.meta.url))
const config = fileURLToPath(new URL("./tsconfig.invalid.json", import.meta.url))
const compiler = fileURLToPath(new URL("../../node_modules/typescript/bin/tsc", import.meta.url))
const expectedLines = readFileSync(fixture, "utf8")
  .split("\n")
  .flatMap((line, index) => line.includes("@invalid") ? [index + 1] : [])

const result = spawnSync(process.execPath, [compiler, "--project", config], { encoding: "utf8" })
const diagnostics = `${result.stdout}${result.stderr}`

if (result.status === 0) throw new Error("Invalid TypeScript consumer unexpectedly typechecked")
if (/error TS(?:2307|7016):/.test(diagnostics)) {
  throw new Error(`Invalid consumer failed declaration discovery instead of public API usage:\n${diagnostics}`)
}

for (const line of expectedLines) {
  if (!diagnostics.includes(`invalid.ts(${line},`)) {
    throw new Error(`Expected a TypeScript diagnostic on invalid.ts line ${line}:\n${diagnostics}`)
  }
}

console.log(`Verified ${expectedLines.length} representative invalid TypeScript usages fail`)
