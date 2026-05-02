import { twMerge } from "tailwind-merge";

export function OverlayWindow(props: {warning?: boolean, error?: boolean, nobg?: boolean} & React.ComponentPropsWithoutRef<"div">) {
    const {className, children, warning, error, nobg: bgBlur, ...rest} = props;

    return (
        <div className={twMerge("border border-app-edge m-auto p-4 flex flex-col", bgBlur ? "backdrop-blur-md" : "bg-layerA", "border-warn".where(!!warning), "border-error".where(!!error), className)} {...rest} onClick={e => e.stopPropagation()}>
            {children}
        </div>
    );
}
