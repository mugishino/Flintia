import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { useOutsideClick } from "~/hooks/useOutsideClick";

export function PageSelect(props: {
    page: number,
    max: number,
    onChange: (page: number) => void,
    className?: string,
    leftClassName?: string,
    centerClassName?: string,
    rightClassname?: string,
}) {
    const [isInput, setIsInput] = useState(false);
    const outside = useOutsideClick(() => setIsInput(false));

    const page = props.page;
    const max = props.max.toInt();

    function setPage(num: number) {
        setIsInput(false);
        props.onChange(num.keepRange(0, max));
    }

    const centerClass = twMerge("border-x-0", props.centerClassName);

    return (
        <div className={twMerge("flex flex-row w-1/6", props.className)} ref={outside}>
            <button className={twMerge("w-3/5", props.leftClassName)} onClick={() => setPage(page-1)} disabled={page<=0}>{"<"}</button>
            {isInput
            ? <input type="number" autoFocus onKeyDown={e => {
                if (e.key != "Enter") return;
                setPage((e.currentTarget.valueAsNumber-1).orDefault(page));
            }} className={centerClass}/>
            : <button onClick={() => setIsInput(true)} className={centerClass}>PAGE: {page+1}</button>
            }
            <button className={twMerge("w-3/5", props.rightClassname)} onClick={() => setPage(page+1)} disabled={page>=max}>{">"}</button>
        </div>
    );
}
