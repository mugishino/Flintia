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

/**
 * オーバーレイを要素と、表示内容を変更する関数を返します。
 * @returns [オーバーレイ要素, 内容変更関数]
 */
export function useOverlay(): [React.JSX.Element, (elem: React.JSX.Element)=>void] {
    const [value, setValue] = useState<React.JSX.Element|null>(null);
    const view = <div className="absolute left-0 top-0 z-50 h-full w-full bg-[#000d] flex" onClick={() => setValue(null)}>{value}</div>;
    return [
        value == null ? <></> : view,
        elem => setValue(elem)
    ];
}
