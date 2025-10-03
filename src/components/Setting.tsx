export default function Setting({
    title,
    hide,
    children,
}: {
    title: string,
    hide?: boolean,
    children: React.ReactNode,
}) {
    return (
        <div className={`flex flex-row justify-between ${hide == true ? "hidden" : "visible"}`}>
            <span className="pl-1">{title}</span>
            <div className="min-w-2/5 [&>*]:min-h-7">{children}</div>
        </div>
    );
}
