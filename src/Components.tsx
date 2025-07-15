export function Section({title, children}: {title: string, children: React.ReactElement}) {
    return (
        <div className="flex flex-col text-center not-last:mb-4">
            <div className="text-[1.2rem]">{title}</div>
            {children}
        </div>
    );
}

export function Setting({
    title,
    hide,
    children,
}: {
    title: string,
    hide?: boolean,
    children: React.ReactElement,
}) {
    return (
        <div className={`flex flex-row justify-between ${hide == true ? "hidden" : "visible"}`}>
            <span className="pl-1">{title}</span>
            <div className="min-w-1/3 [&>*]:w-full [&>*]:h-7">{children}</div>
        </div>
    );
}
