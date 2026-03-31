import { twMerge } from "tailwind-merge";

export default function Setting({
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
            <div className={twMerge("min-w-2/5", childClassName)}>{children}</div>
        </div>
    );
}
