import { copyText } from "~/util";

export default function MinMaxValue() {
    function CreateElem(props: {title: string, min: number, max: number}) {
        return <button
            className="inline-block w-40"
            title="LeftClick: Max, RightClick: MIN"
            onClick   ={() => copyText(props.max.toString())}
            onAuxClick={() => copyText(props.min.toString())}
        >{props.title}</button>;
    }
    return (
        <div>
            <CreateElem title="sbyte"  min={-128}                 max={127}/>
            <CreateElem title="byte"   min={0}                    max={255}/>
            <CreateElem title="ushort" min={0}                    max={65535}/>
            <CreateElem title="short"  min={-32768}               max={32767}/>
            <CreateElem title="uint"   min={0}                    max={4294967295}/>
            <CreateElem title="int"    min={-2147483648}          max={2147483647}/>
            <CreateElem title="ulong"  min={0}                    max={18446744073709551615}/>
            <CreateElem title="long"   min={-9223372036854775808} max={9223372036854775807}/>
        </div>
    );
}
