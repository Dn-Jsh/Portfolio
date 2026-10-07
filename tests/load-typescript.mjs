import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);

// Run the actual application modules using Node's existing test runner.
export function loadModule(pathname, imports = {}, globals = {}) {
  const filename = new URL(pathname, import.meta.url);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX },
    fileName: filename.pathname,
  });
  const testModule = { exports: {} };
  vm.runInNewContext(outputText, {
    module: testModule,
    exports: testModule.exports,
    URL,
    require: (name) => imports[name] ?? require(name),
    ...globals,
  }, { filename: filename.pathname });
  return testModule.exports;
}
