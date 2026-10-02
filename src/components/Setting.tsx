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
}: {
    title: string,
    hide?: boolean,
    children: React.ReactNode,
    className?: string
    titleClassName?: string,
    childClassName?: string,
    tooltip?: string,
    ratio?: number|undefined,
}) {
    return (
        <div className={twMerge(`flex flex-row justify-between`, "hidden".where(hide??false), className)} title={tooltip}>
            <span className={twMerge("pl-1", titleClassName)}>{title}</span>
            <div style={{minWidth: ratio ? ratio*100+"%" : undefined}} className={twMerge(ratio == undefined ? "min-w-1/2" : `min-w-[${ratio*100}%]`, childClassName)}>{children}</div>
        </div>
    );
}
