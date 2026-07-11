import { twMerge } from "tailwind-merge";
import { SVGIcon } from "./SVGIcon";

export function SVGButton(props: {src: string, disabled?: boolean, className?: string} & React.ComponentPropsWithoutRef<"button">) {
    const {disabled, className, src, ...rest} = props;

    return (
        <button className={twMerge(`w-auto p-0 ${disabled ? "fill-svg-disable" : "fill-svg"}`, className)} disabled={disabled} {...rest}>
            <SVGIcon src={src}/>
        </button>
    );
}
