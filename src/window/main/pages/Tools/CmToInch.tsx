import { useState } from "react";

export function CmToInch() {
    const [cm, setCm] = useState(0);

    return (
        <div className="flex flex-row">
            <input type="number" value={cm} onChange={v => setCm(v.currentTarget.valueAsNumber.orDefault(0))}/>
            <div className="mx-4 flex items-center">=</div>
            <input type="number" value={cm/2.54} onChange={v => setCm(v.currentTarget.valueAsNumber.orDefault(0)*2.54)}/>
        </div>
    );
}
