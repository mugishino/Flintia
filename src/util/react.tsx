import React, { useEffect, useState } from "react";

/**
 * useEffectでasync関数を使える版
 * @param effect async関数
 * @param deps 変更検知
 */
export function useEffectAsync(effect: () => Promise<void>, deps?: React.DependencyList) {
    useEffect(() => {effect()}, deps);
}

/**
 * 強制的にレンダリングを更新する関数を返します。
 * @returns 更新関数
 */
export function useUpdateRender() {
    const [value, setValue] = useState(false);
    return () => setValue(!value);
}
