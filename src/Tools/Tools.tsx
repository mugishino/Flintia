import React, { useState } from "react";

export default function Tools() {
    const [uuidView, setUUID] = useState(crypto.randomUUID());


    function copyText(text: string) {
        navigator.clipboard.writeText(text);
    }



    function Button(props: {
        className   ?: string,
        title       ?: string,
        onClick     ?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
        onAuxClick  ?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
        onMouseDown ?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void,
        children: React.ReactElement|string,
    }) {
        return (
            <div
            className={`inline-block cursor-pointer text-white border-1 border-layerB bg-layerB transition-[200ms] hover:bg-layerC active:transition-[0ms] active:bg-green-800 ${props.className}`}
            title={props.title} onClick={props.onClick} onAuxClick={props.onAuxClick} onMouseDown={props.onMouseDown}
            >{props.children}</div>
        );
    }

    function ToolElem({title, children}: {title: string, children: React.ReactElement}) {
        return (
            <div className="flex flex-col text-center mb-4">
                <div>{title}</div>
                {children}
            </div>
        );
    }



    return (
        <>
            <ToolElem title="UUID Generator">
                <Button
                    title="左クリでコピー | 右クリでハイフンなしをコピー"
                    onMouseDown={e => {
                        // 2 is mouse-right
                        copyText(e.button != 2 ? uuidView : uuidView.replace(/-/g, ""));
                        setUUID(crypto.randomUUID());
                    }}
                >{uuidView}</Button>
            </ToolElem>

            <ToolElem title="MIN_MAX_VALUE" children={(() => {
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
        </>
    );
}
