import { useState } from "react";
import { twMerge } from "tailwind-merge";

export default function useSearch(props: {
    defaultValue?: string,
    className?: string,
    autofocus?: boolean,
}): [React.JSX.Element, string, (v:string) => void] {
    const [value, setValue] = useState(props.defaultValue ?? String.empty);
    return [
        <div className={twMerge("flex flex-row border-1", props.className)}>
            <input placeholder="Search..." value={value} onChange={v => setValue(v.currentTarget.value)} className="border-0 bg-layerA focus:bg-layerB" autoFocus={props.autofocus}/>
            <button onClick={() => setValue(String.empty)} className="w-16 border-0 border-l-1">削除</button>
        </div>,
        value,
        (v: string) => setValue(v),
    ];
}
