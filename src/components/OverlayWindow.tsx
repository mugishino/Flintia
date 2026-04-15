import { twMerge } from "tailwind-merge";

export function OverlayWindow(props: React.ComponentPropsWithoutRef<"div">) {
    const {className, children, ...rest} = props;

    return (
        <div className={twMerge("border border-app-edge m-auto bg-layerA p-4 flex flex-col", className)} {...rest} onClick={e => e.stopPropagation()}>
            {children}
        </div>
    );
}
