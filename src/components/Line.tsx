import { twMerge } from "tailwind-merge";

export function Line(props: {vertical?: boolean} & React.ComponentPropsWithoutRef<"div">) {
    const {vertical, className, ...rest} = props;

    return (
        <div className={twMerge(vertical ? "border-l mx-1" : "border-t my-1", className)} {...rest}></div>
    );
}
