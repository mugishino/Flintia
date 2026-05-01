import { twMerge } from "tailwind-merge";

export function Setting({
    title,
    hide,
    children,
    className,
    titleClassName,
    childClassName,
}: {
    title: string,
    hide?: boolean,
    children: React.ReactNode,
    className?: string
    titleClassName?: string,
    childClassName?: string,
}) {
    return (
        <div className={twMerge(`flex flex-row justify-between`, "hidden".where(hide??false), className)}>
            <span className={twMerge("pl-1", titleClassName)}>{title}</span>
            <div className={twMerge("max-w-1/2 w-full", childClassName)}>{children}</div>
        </div>
    );
}
