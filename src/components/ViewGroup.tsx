import { twMerge } from "tailwind-merge";

export default function ViewGroup({children, show, className}: {children: React.ReactNode, show: boolean, className?: string}) {
    return (
        <div className={twMerge(className, "contents", "hidden".where(!show))}>{children}</div>
    );
}
