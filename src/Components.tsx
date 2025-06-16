import { cls } from "./util";

export function Tool({title, children}: {title: string, children: React.ReactElement}) {
    return (
        <div className="flex flex-col text-center mb-4">
            <div className="text-[1.2rem]">{title}</div>
            {children}
        </div>
    );
}

export function Button(props: {
    className   ?: string,
    title       ?: string,
    onClick     ?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    onAuxClick  ?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    onMouseDown ?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
    clickColor  ?: "green"|"red"|"blue",
    children: React.ReactElement|string,
}) {
    const clickcolor = {
        "red": "bg-red-800",
        "blue": "bg-blue-800",
        "green": "bg-green-800",
    }[props.clickColor ?? "green"];

    return (
        <div
        className={cls(
            "inline-block cursor-pointer text-center text-white border-1 border-layerB bg-layerB transition-[200ms]",
            "hover:bg-layerC",
            `active:transition-[0ms] active:${clickcolor}`,
            props.className,
        )}
        title={props.title} onClick={props.onClick} onAuxClick={props.onAuxClick} onMouseDown={props.onMouseDown}
        >{props.children}</div>
    );
}
