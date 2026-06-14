// liveness-driver.js — Node の ping/pong 死活ループのグルー例(判定=wasm、WS=Node)。
export async function loadLiveness(wasmUrl) {
  const { readFile } = await import("node:fs/promises");
  const mod = await WebAssembly.compile(await readFile(new URL(wasmUrl, import.meta.url)));
  const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
  const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
  const alive = new WeakMap();
  return {
    intervalMs: ex.interval_ms(),
    onConnect(ws) { alive.set(ws, true); ws.on("pong", () => alive.set(ws, true)); },
    // PING_INTERVAL ごとに各接続へ。terminate すべきなら true。
    tick(ws) {
      const action = ex.tick_action(alive.get(ws) ? 1 : 0);
      if (action === 1) { ws.terminate(); return true; }
      alive.set(ws, false); try { ws.ping(); } catch {}
      return false;
    },
  };
}
