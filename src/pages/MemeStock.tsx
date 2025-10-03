import { useState } from "react";
import { ToggleSwitch, useSearch } from "~/Components";
import MemeStock_Image from "./MemeStock/Image";

export default function MemeStock() {
    const [paste, setPaste] = useState(true);
    const [searchElem, search] = useSearch({className: "border-0 border-r-1 w-1/3"});

    return (
        <div className="flex flex-col overflow-y-hidden h-full w-full">
            <div className="flex flex-row h-7 justify-between border-b-1">
                {searchElem}
                <ToggleSwitch label="Paste" value={paste} onChange={() => setPaste(!paste)} className="border-0 border-l-1 w-1/8"/>
            </div>
            <MemeStock_Image paste={paste} search={search}/>
        </div>
    );
}
