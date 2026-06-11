import { twMerge } from "tailwind-merge";

export function ViewGroup({children, show, className}: {children: React.ReactNode, show: boolean, className?: string}) {
    return (
        <div className={twMerge("contents", className, "hidden".where(!show))}>{children}</div>
    );
}
