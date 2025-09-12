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

export function ToggleSwitch({value, label, onChange}: {value: boolean, label?: string, onChange: (v: boolean) => void}) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`bg-layerB border-1 duration-0 ${value ? "text-enable" : "text-disable"}`}
        >{label ?? (value ? "Enabled" : "Disabled")}</button>
    );
}
