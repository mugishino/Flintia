import React from "react";
import { twMerge } from "tailwind-merge";

export function Section(props: {title: string, toolTip?: string, labelClassName?: string} & React.ComponentPropsWithoutRef<"div">) {
    const {title, toolTip, labelClassName, children, className, ...rest} = props;
    return (
        <div className={twMerge("flex flex-col text-center not-last:mb-4", className)} {...rest}>
            <div className={twMerge("text-[1.2rem]", labelClassName)} title={toolTip}>{title}</div>
            {children}
        </div>
    );
}
