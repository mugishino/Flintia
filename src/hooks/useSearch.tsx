import { useState } from "react";
import { twMerge } from "tailwind-merge";

/**
 * 検索ボックスと値、変更用関数を返します。
 * @param options オプション
 * @returns [検索ボックス要素, 値, 値変更関数]
 */
export default function useSearch(options: {
    /** 検索ボックスの初期値 */
    defaultValue?: string,
    /** 検索ボックスのclass */
    className?: string,
    /** 自動フォーカスするかどうか */
    autofocus?: boolean,
}): [
    React.JSX.Element,
    string,
    (v: string) => void
] {
    const [value, setValue] = useState(options.defaultValue ?? String.empty);
    return [
        <div className={twMerge("flex flex-row border", options.className)}>
            <input placeholder="Search..." value={value} onChange={v => setValue(v.currentTarget.value)} className="border-0 bg-layerA focus:bg-layerB" autoFocus={options.autofocus}/>
            <button onClick={() => setValue(String.empty)} className="w-16 border-0 border-l">削除</button>
        </div>,
        value,
        (v: string) => setValue(v),
    ];
}
