import React, { useState } from "react";

/**
 * オーバーレイ要素と、表示内容を変更する関数を返します。
 * 内容の再レンダリングが発生しない、シンプルな表示に適しています。
 * @returns [オーバーレイ要素, 内容変更関数]
 */
export function useStaticOverlay(grayBackground=true): [React.JSX.Element, (elem: React.JSX.Element|undefined) => void] {
    const [value, setValue] = useState<React.JSX.Element|undefined>(undefined);

    const view = <div
        className={`absolute left-px top-px z-50 h-[calc(100%-2px)] w-[calc(100%-2px)] flex ${grayBackground ? "bg-overlay-bg" : "bg-transparent"}`}
        onClick={() => setValue(undefined)}
    >{value}</div>;

    return [
        value == undefined ? <></> : view,
        elem => setValue(elem)
    ];
}
