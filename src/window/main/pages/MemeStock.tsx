import { useState } from "react";
import MemeStock_Image from "./MemeStock/Image";
import ToggleSwitch from "~/components/ToggleSwitch";
import Search from "~/components/Search";

export default function MemeStock() {
    const [paste, setPaste] = useState(true);
    const [enter, setAutoEnter] = useState(true);
    const [search, setSearch] = useState(String.empty);

    return (
        <div className="flex flex-col overflow-y-hidden h-full w-full">
            <div className="flex flex-row justify-between border-b">
                <Search value={search} onUpdate={v => setSearch(v)} className="border-0 w-1/3"/>
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
