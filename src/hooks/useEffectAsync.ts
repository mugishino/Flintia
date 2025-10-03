import { useEffect } from "react";

/**
 * useEffectでasync関数を使える版
 * @param effect async関数
 * @param deps 変更検知
 */
export function useEffectAsync(effect: () => Promise<void>, deps?: React.DependencyList) {
    useEffect(() => {effect()}, deps);
}
