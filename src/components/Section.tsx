export default function Section({title, children}: {title: string, children: React.ReactNode}) {
    return (
        <div className="flex flex-col text-center not-last:mb-4">
            <div className="text-[1.2rem]">{title}</div>
            {children}
        </div>
    );
}
