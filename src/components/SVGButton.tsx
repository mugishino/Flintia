import { ReactSVG } from "react-svg";
import { twMerge } from "tailwind-merge";

export default function SVGButton({src, disabled, onClick, className}: {src: string, disabled?: boolean, onClick?: () => void, className?: string}) {
    return (
        <button onClick={onClick} className={twMerge("w-auto p-0", className)} disabled={disabled}>
            <ReactSVG src={src} className={`h-full aspect-square ${disabled ? "fill-svg-disable" : "fill-svg"}`}/>
        </button>
    );
}
