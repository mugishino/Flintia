export function Tool({title, children}: {title: string, children: React.ReactElement}) {
    return (
        <div className="flex flex-col text-center mb-4">
            <div className="text-[1.2rem]">{title}</div>
            {children}
        </div>
    );
}
