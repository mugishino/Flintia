import { twMerge } from "tailwind-merge";

export function Setting({
    title,
    hide,
    children,
    className,
    titleClassName,
    childClassName,
    tooltip,
    ratio,
    disable,
}: {
    title: string,
    hide?: boolean,
    children: React.ReactNode,
    className?: string
    titleClassName?: string,
    childClassName?: string,
    tooltip?: string,
    ratio?: number|undefined,
    disable?: boolean,
}) {
    return (
        <div className={twMerge(`flex flex-row justify-between`, "hidden".where(hide??false), "pointer-events-none".where(disable??false), className)} title={tooltip}>
            <span className={twMerge("pl-1", "text-grayout".where(disable??false), titleClassName)}>{title}</span>
            <div style={{minWidth: ratio ? ratio*100+"%" : undefined}} className={twMerge(ratio == undefined ? "w-1/2" : `min-w-[${ratio*100}%]`, childClassName)}>{children}</div>
        </div>
    );
}
