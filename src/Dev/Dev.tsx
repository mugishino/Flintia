import { useState } from "react";
import { Button, Tool } from "~/Components";
import UnixTime from "./UnixTime";
import { copyText } from "~/util";

export default function Dev() {
    const [uuidView, setUUID] = useState(crypto.randomUUID());



    return (
        <>
            <Tool title="UUID Generator">
                <Button
                    title="左クリでコピー | 右クリでハイフンなしをコピー"
                    onMouseDown={e => {
                        // 2 is mouse-right
                        copyText(e.button != 2 ? uuidView : uuidView.replace(/-/g, String.empty));
                        setUUID(crypto.randomUUID());
                    }}
                >{uuidView}</Button>
            </Tool>

            <Tool title="MIN_MAX_VALUE" children={(() => {
                function CreateElem(props: {title: string, min: number, max: number}) {
                    return <Button
                        className="inline-block w-40"
                        title="LeftClick: Max, RightClick: MIN"
                        onClick   ={() => copyText(props.max.toString())}
                        onAuxClick={() => copyText(props.min.toString())}
                    >{props.title}</Button>;
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
            })()}/>

            <Tool title="UnixTime">
                <UnixTime/>
            </Tool>
        </>
    );
}
