import React, { useState } from "react";
import Config from "~/Config";
import { copyText, notExists, useEffectAsync } from "~/util";
import { readTextFile } from "@tauri-apps/plugin-fs";
import yaml from "js-yaml";

class PassRecord {
    title       = String.empty;
    username    = String.empty;
    mail        = String.empty;
    password    = String.empty;
    note        = String.empty;
    hide        = false;
}

async function getPassRecords() {
    const path = (await Config.load()).passfile;
    if (path == String.empty || await notExists(path)) {
        return [];
    }

    const raw = await readTextFile(path);
    return yaml.load(raw) as PassRecord[];
}



export default function App() {
    const [view, setView] = useState<PassRecord[]>([]);
    const [search, setSearch] = useState(String.empty);
    const [errMsg, setErrMsg] = useState(String.empty);

    // setting
    const [showHide, setShowHide] = useState(false);



    useEffectAsync(async () => {
        setErrMsg(String.empty);
        try {
            const data = await getPassRecords();
            const sorted = data.sort((a, b) => a.title.localeCompare(b.title)) // A-Zでソート
            setView(sorted);
        } catch (err) {
            setErrMsg(String(err));
        }
    }, [search, showHide]);

    const result: React.JSX.Element[] = [];
    const rowStyle = "cursor-pointer duration-100 hover:bg-layerA active:bg-green-800"
    view.forEach((v, i) => {
        if (v.hide && !showHide) return;
        if (search != String.empty && !v.title.toLowerCase().startsWith(search.toLowerCase())) return;
        result.push(
            <details className="cursor-pointer open:text-center open:border-y-1 not-open:hover:bg-layerA" key={i} tabIndex={-1}>
                <summary className={`in-open:bg-layerA list-none ${v.hide ? "text-text-gray" : undefined}`}>{v.title}</summary>
                {!v.username || <div className={rowStyle} title="Click To Copy" onClick={() => copyText(v.username, true)}>UserName</div>}
                {!v.mail     || <div className={rowStyle} title="Click To Copy" onClick={() => copyText(v.mail    , true)}>Mail Address</div>}
                {!v.password || <div className={rowStyle} title="Click To Copy" onClick={() => copyText(v.password, true)}>Password</div>}
                {!v.note ||
                <details className="cursor-pointer hover:bg-layerA open:border-t-1 [&:open_summary]:bg-layerA">
                    <summary>[Note]</summary>
                    <div className="select-text">{v.note}</div>
                </details>}
            </details>
        );
    });



    return (
        <>
            <div className="flex">
                <input autoFocus className="grow bg-layerA border-0 border-b-1 border-border focus:bg-layerB" value={search} onChange={e=>setSearch(e.currentTarget.value)} type="text" placeholder="search"/>
                <div className="px-2 bg-layerB border-l-1 border-neutral-600 hover:cursor-pointer hover:bg-layerC" onClick={()=>setSearch(String.empty)}>削除</div>
            </div>
            <div className="grow overflow-x-hidden overflow-y-scroll">
                <div className="text-fail">{errMsg}</div>
                {result}
            </div>
            <div className="border-t-1 flex flex-row">
                <button onClick={() => setShowHide(!showHide)} className={`border-0 grow bg-layerA duration-0 hover:bg-layerB ${showHide ? "text-enable" : "text-disable"}`}>ShowHide</button>
            </div>
        </>
    );
}
