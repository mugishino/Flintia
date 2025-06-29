import UnixTime from "./UnixTime";
import MinMaxValue from "./MinMaxValue";
import UUIDGenerator from "./UUIDGenerator";

export function Tool({title, children}: {title: string, children: React.ReactElement}) {
    return (
        <div className="flex flex-col text-center mb-4">
            <div className="text-[1.2rem]">{title}</div>
            {children}
        </div>
    );
}

export default function Tools() {
    return (
        <>
            <Tool title="UUID Generator" children={<UUIDGenerator/>}/>
            <Tool title="MIN_MAX_VALUE" children={<MinMaxValue/>}/>
            <Tool title="UnixTime" children={<UnixTime/>}/>
        </>
    );
}
