import { ReactSVG } from "react-svg";
import { twMerge } from "tailwind-merge";

export default function SVGButton(props: {src: string, disabled?: boolean, className?: string} & React.ComponentPropsWithoutRef<"button">) {
    const {disabled, className, src, ...rest} = props;

    return (
        <button className={twMerge(`w-auto p-0 ${disabled ? "fill-svg-disable" : "fill-svg"}`, className)} disabled={disabled} {...rest}>
            <ReactSVG src={src} className={`h-full aspect-square fill-inherit`}/>
        </button>
    );
}
