import { useState } from "react";

export default function HexConverter() {
    const [value, setValue] = useState<number>(0);
    const [beforeRadix, setBeforeRadix] = useState(16);
    const [afterRadix, setAfterRadix] = useState(10);

    return (
        <>
            <div className="flex flex-row">
                <input type="number" min={2} max={36} value={beforeRadix} onChange={e => setBeforeRadix(e.currentTarget.valueAsNumber)} className="text-center w-1/6"/>
                <input type="text" value={value.toString(beforeRadix)} onChange={e => setValue(parseInt(e.currentTarget.value, beforeRadix))} className="grow"/>
            </div>
            <div className="flex flex-row">
                <input type="number" min={2} max={36} value={afterRadix} onChange={e => setAfterRadix(e.currentTarget.valueAsNumber)} className="text-center w-1/6"/>
                <input type="text" value={value.toString(afterRadix)} onChange={e => setValue(parseInt(e.currentTarget.value, afterRadix))} className="grow"/>
            </div>
        </>
    );
}
