import { useState } from "react";

/**
 * MapのStateを作ります。
 * データ操作関数: アロー関数を用いれば一部の書き換えが簡単に可能。そのまま値を渡すことで新しい値として代入
 * @param init 初期値
 * @returns [値, データ操作]
 */
export function useMapState<K, V>(init?: Map<K, V>) {
    const [value, setValue] = useState(init ?? new Map<K, V>());

    return [
        value,
        (call: ((prev: Map<K, V>) => Map<K, V>)|Map<K, V>) => setValue(typeof call == "function" ?  prev => call(new Map(prev)) : new Map(call)),
    ] as const;
}
