import { twMerge } from "tailwind-merge";
import { SVGIcon } from "./SVGIcon";

export function CheckBox(props: {
    checked: boolean;
} & React.ComponentPropsWithoutRef<"div">) {
    const {checked, className, ...rest} = props;
    return (
        <div className={twMerge("interactives aspect-square inline-block w-auto h-lh duration-0 relative", checked ? "bg-info" : "", className)} {...rest}>
            <SVGIcon src="check" className={`h-full w-full absolute left-0 top-0 fill-svg ${"hidden".where(!checked)}`}/>
        </div>
    );
}
