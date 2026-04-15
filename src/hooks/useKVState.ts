import { useState } from "react";

/**
 * 連想配列用のState
 * @param init 初期値。
 * @returns [データ, 特定のキーを上書き, データ自体上書き]
 */
export function useKVState<T>(init: T) {
    const [state, setState] = useState(init);

    return [
        state,
        <K extends keyof T>(key: K, value: T[K]) => {
            setState(prev => ({...prev, [key]: value}));
        },
        (data: T) => {
            setState({...data});
        },
    ] as const;
}
