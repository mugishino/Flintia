import { useState } from "react";
import css from "./Tools.module.css";

export default function Tools() {
    const [uuidView, setUUID] = useState(crypto.randomUUID());


    function copyText(text: string) {
        navigator.clipboard.writeText(text);
    }

    return (
        <>
            <div className={css.tool}>
                <div className={css.title}>UUID Generator</div>
                {(() => {
                    function uuidCopyAndRefresh(hyphen: boolean) {
                        copyText(hyphen ? uuidView : uuidView.replace(/-/g, ""));
                        setUUID(crypto.randomUUID());
                    }
                    return <div title="click to copy, right click to copy without hyphens"
                        className={css.button}
                        onMouseDown={e => uuidCopyAndRefresh(e.button != 2)} // 2 is mouse-right
                    >{uuidView}</div>
                })()}
            </div>

            <div className={css.tool}>
                <div className={css.title}>MIN_MAX_VALUE</div>
                {(() => {
                    function CreateElem(props: {title: string, min: number, max: number}) {
                        return <div
                            className={css.button+" inline-block w-38"}
                            title="LeftClick: MAX, RightClick: MIN"
                            onClick   ={() => copyText(props.max.toString())}
                            onAuxClick={() => copyText(props.min.toString())}
                        >{props.title}</div>;
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
                })()}
            </div>
        </>
    );
}
