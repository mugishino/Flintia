import { useState } from "react";

/**
 * オーバーレイを要素と、表示内容を変更する関数を返します。
 * @returns [オーバーレイ要素, 内容変更関数]
 */
export default function useOverlay(): [React.JSX.Element, (elem: React.JSX.Element)=>void] {
    const [value, setValue] = useState<React.JSX.Element|null>(null);
    const view = <div className="absolute left-0 top-0 z-50 h-full w-full bg-[#000d] flex" onClick={() => setValue(null)}>{value}</div>;
    return [
        value == null ? <></> : view,
        elem => setValue(elem)
    ];
}
