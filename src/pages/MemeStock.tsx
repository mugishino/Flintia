import { useState } from "react";
import MemeStock_Image from "./MemeStock/Image";
import ToggleSwitch from "~/components/ToggleSwitch";
import useSearch from "~/hooks/useSearch";

export default function MemeStock() {
    const [paste, setPaste] = useState(true);
    const [enter, setAutoEnter] = useState(true);
    const [searchElem, search] = useSearch({className: "border-0 border-r-1 w-1/3"});

    return (
        <div className="flex flex-col overflow-y-hidden h-full w-full">
            <div className="flex flex-row h-7 justify-between border-b-1">
                {searchElem}
                <div className="grow-3 text-[0px]">MARGIN</div>
                <div className="flex flex-row grow">
                    <ToggleSwitch label="AutoEnter" value={enter} onChange={() => setAutoEnter(!enter)} className="border-0 border-l-1"/>
                    <ToggleSwitch label="Paste" value={paste} onChange={() => setPaste(!paste)} className="border-0 border-l-1"/>
                </div>
            </div>
            <MemeStock_Image paste={paste} enter={enter} search={search}/>
        </div>
    );
}
