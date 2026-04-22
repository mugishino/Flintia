export function Section({title, toolTip, children}: {title: string, toolTip?: string, children: React.ReactNode}) {
    return (
        <div className="flex flex-col text-center not-last:mb-4">
            <div className="text-[1.2rem]" title={toolTip}>{title}</div>
            {children}
        </div>
    );
}
