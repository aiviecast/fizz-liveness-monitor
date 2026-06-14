import { readFileSync } from "node:fs";
const mod = await WebAssembly.compile(readFileSync(new URL("../build/live.wasm", import.meta.url)));
const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
let ok = true; const ck = (g, w, m) => { if (g !== w) { console.error(`FAIL ${m}: ${g}!=${w}`); ok = false; } };
ck(ex.tick_action(1), 0, "alive→ping"); ck(ex.tick_action(0), 1, "dead→terminate");
ck(ex.is_dead(11000, 0, 5000), 1, "11s dead"); ck(ex.is_dead(9000, 0, 5000), 0, "9s alive");
ck(ex.interval_ms(), 5000, "interval");
console.log(ok ? "wasm OK — liveness matches native" : "FAIL"); if (!ok) process.exit(1);
