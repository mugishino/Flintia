import { useState } from "react";

/**
 * オーバーレイコンポーネントと、表示関数を返します。
 * @returns [オーバーレイコンポーネント、表示関数]
 */
export default function useOverlay(): [({children}: {children: React.ReactNode}) => React.JSX.Element, () => void] {
    const [show, setShow] = useState(false);
    return [
        ({children}) => <div className={`absolute left-0 top-0 z-50 h-full w-full bg-[#000d] flex ${"hidden".where(!show)}`} onClick={() => setShow(false)}>{children}</div>,
        () => setShow(true),
    ];
}

/**
 * オーバーレイ要素と、表示内容を変更する関数を返します。
 * 内容の再レンダリングが発生しない、シンプルな表示に適しています。
 * @returns [オーバーレイ要素, 内容変更関数]
 */
export function useStaticOverlay(): [React.JSX.Element, (elem: React.JSX.Element)=>void] {
    const [value, setValue] = useState<React.JSX.Element|null>(null);
    const view = <div className="absolute left-0 top-0 z-50 h-full w-full bg-[#000d] flex" onClick={() => setValue(null)}>{value}</div>;
    return [
        value == null ? <></> : view,
        elem => setValue(elem)
    ];
}
