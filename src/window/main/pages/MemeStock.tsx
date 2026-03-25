import { useState } from "react";
import MemeStock_Image from "./MemeStock/Image";
import ToggleSwitch from "~/components/ToggleSwitch";
import useSearch from "~/hooks/useSearch";

export default function MemeStock() {
    const [paste, setPaste] = useState(true);
    const [enter, setAutoEnter] = useState(true);
    const [searchElem, search] = useSearch({className: "border-0 border-r w-1/3"});

    return (
        <div className="flex flex-col overflow-y-hidden h-full w-full">
            <div className="flex flex-row h-7 justify-between border-b">
                {searchElem}
                <div className="grow-3 text-[0px]">MARGIN</div>
                <div className="flex flex-row grow">
                    <ToggleSwitch label="AutoEnter" value={enter} onChange={() => setAutoEnter(!enter)} className="border-0 border-l"/>
                    <ToggleSwitch label="Paste" value={paste} onChange={() => setPaste(!paste)} className="border-0 border-l"/>
                </div>
            </div>
            <MemeStock_Image paste={paste} enter={enter} search={search}/>
        </div>
    );
}
