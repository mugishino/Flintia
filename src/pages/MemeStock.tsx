import { useState } from "react";
import { ToggleSwitch } from "~/Components";
import MemeStock_Image from "./MemeStock/Image";

export default function MemeStock() {
    const [paste, setPaste] = useState(true);
    const [search, setSearch] = useState(String.empty);

    return (
        <div className="flex flex-col overflow-y-hidden h-full w-full">
            <div className="flex flex-row h-7 border-b-1 justify-between">
                <div className="[&>*]:border-r-1 w-1/3 flex">
                    <input className="border-0 bg-layerA focus:bg-layerB grow" placeholder="Search" value={search} onChange={v => setSearch(v.currentTarget.value)}/>
                    <button className="border-0 w-12" onClick={() => setSearch(String.empty)}>削除</button>
                </div>
                <ToggleSwitch label="Paste" value={paste} onChange={() => setPaste(!paste)} className="border-0 border-l-1 w-1/8"/>
            </div>
            <MemeStock_Image paste={paste} search={search}/>
        </div>
    );
}
