import { useState } from "react";

/**
 * MapのStateを作ります。
 * @param init 初期値
 * @returns [値, データ操作, 全て上書き]
 */
export function useMapState<K, V>(init?: Map<K, V>) {
    const [value, setValue] = useState(init ?? new Map<K, V>());

    return [
        value,
        (call: (prev: Map<K, V>) => Map<K, V>) => setValue(prev => call(new Map(prev))),
        (v: Map<K, V>) => setValue(v),
    ] as const;
}
