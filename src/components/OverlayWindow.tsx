import { twMerge } from "tailwind-merge";

export function OverlayWindow(props: {warning?: boolean, error?: boolean} & React.ComponentPropsWithoutRef<"div">) {
    const {className, children, warning, error, ...rest} = props;

    return (
        <div className={twMerge("border border-app-edge m-auto bg-layerA p-4 flex flex-col", "border-warn".where(!!warning), "border-error".where(!!error), className)} {...rest} onClick={e => e.stopPropagation()}>
            {children}
        </div>
    );
}
