import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

export function Section({title, children}: {title: string, children: React.ReactNode}) {
    return (
        <div className="flex flex-col text-center not-last:mb-4">
            <div className="text-[1.2rem]">{title}</div>
            {children}
        </div>
    );
}

// childrenの型がReactElement[]の理由: ReactNodeにするとlengthが使えない他、そもそもこれは複数の要素が前提のコンポーネントです。
export function EvenlyDividedRow({children}: {children: React.ReactElement[]}) {
    return (
        <div className={`flex flex-row flex-wrap overflow-x-clip [&>*]:w-0 [&>*]:grow`}>
            {children}
        </div>
    );
}

export function Setting({
    title,
    hide,
    children,
}: {
    title: string,
    hide?: boolean,
    children: React.ReactNode,
}) {
    return (
        <div className={`flex flex-row justify-between ${hide == true ? "hidden" : "visible"}`}>
            <span className="pl-1">{title}</span>
            <div className="min-w-2/5 [&>*]:min-h-7">{children}</div>
        </div>
    );
}

export function ToggleSwitch({value, label, onChange, className}: {value: boolean, label?: string, onChange: (v: boolean) => void, className?: string}) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`${value ? "text-enable" : "text-disable"} ${className ?? String.empty}`}
        >{label ?? (value ? "Enabled" : "Disabled")}</button>
    );
}

export function useSearch(props: {
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
