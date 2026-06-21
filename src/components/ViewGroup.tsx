import { twMerge } from "tailwind-merge";

export function ViewGroup(props: {show: boolean} & React.ComponentPropsWithoutRef<"div">) {
    const {show, className, ...rest} = props;
    return (
        <div className={twMerge("contents", className, "hidden".where(!show))} {...rest}/>
    );
}
