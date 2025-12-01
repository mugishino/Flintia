// childrenの型がReactElement[]の理由: ReactNodeにするとlengthが使えない他、そもそもこれは複数の要素が前提のコンポーネントです。
export default function EvenlyDividedRow({children}: {children: React.ReactElement[]}) {
    return (
        <div className={`flex flex-row flex-wrap overflow-x-clip *:w-0 *:grow`}>
            {children}
        </div>
    );
}
