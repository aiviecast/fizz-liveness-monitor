# fizz-liveness-monitor

Fizz の **接続死活判定コア**(§7 Hub)。WS 接続の ping/pong 死活を tick ごとに判定する。

状態機械(openaituber `server.ts` と同一):
- pong 受信 → `alive = true`
- `PING_INTERVAL`(5s)ごとの tick:
  - `alive == false`(前 tick 以降 pong 無し)→ 死亡とみなし **terminate**
  - `alive == true` → `alive = false` にして **ping**(次 tick までに pong を待つ)

接続死は最遅 `2*interval`(10s)で検知。ping 送信 / terminate / pong 受信は Node の
I/O、判定ロジックは Almide。

## native

```sh
almide build src/main.almd -o build/fizz-liveness-monitor
./build/fizz-liveness-monitor
# {"alive_tick":0,"dead_tick":1,"interval_ms":5000,"dead_at_11s":true,...}
```

## wasm

```sh
almide build src/bridge.almd --target wasm -o build/live.wasm
```

`tick_action(alive) -> Float`(0=ping-and-await, 1=terminate)/ `is_dead(now, last_pong,
interval)` / `interval_ms()`。すべて数値で授受。グルー例
[`browser/liveness-driver.js`](./browser/liveness-driver.js)。CI で wasm↔native 一致を検証。

ツールチェーン: [almide](https://github.com/almide/almide) v0.27.6+。依存なし。
