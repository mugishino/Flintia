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
    const [paste, setPaste] = useState(true);



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

    function PasswordPasteableData({value, label}: {value: string, label: string}) {
        return !value || <div className="cursor-pointer duration-100 hover:bg-layerA active:bg-green-800" title="Click To Copy" onClick={() => copyText(value, paste)}>{label}</div>;
    }

    const result: React.JSX.Element[] = [];
    view.forEach((v, i) => {
        if (v.hide && !showHide) return;
        if (search != String.empty && !v.title.toLowerCase().startsWith(search.toLowerCase())) return;
        result.push(
            <details className="cursor-pointer open:text-center open:border-y-1 not-open:hover:bg-layerA" key={i} tabIndex={-1}>
                <summary className={`in-open:bg-layerA list-none ${v.hide ? "text-text-gray" : undefined}`}>{v.title}</summary>
                <PasswordPasteableData value={v.username} label="UserName"/>
                <PasswordPasteableData value={v.mail    } label="Mail Address"/>
                <PasswordPasteableData value={v.password} label="Password"/>
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
            <div className="flex border-b-1">
                <input autoFocus className="grow bg-layerA border-0 focus:bg-layerB" value={search} onChange={e=>setSearch(e.currentTarget.value)} type="text" placeholder="search"/>
                <button className="border-0 border-l-1 w-1/8" onClick={() => setSearch(String.empty)}>削除</button>
            </div>
            <div className="grow overflow-x-hidden overflow-y-scroll">
                <div className="text-fail">{errMsg}</div>
                {result}
            </div>
            <div className="border-t-1 flex flex-row [&>*]:border-0 [&>*]:not-last:border-r-1">
                <button onClick={() => setShowHide(!showHide)} className={showHide ? "text-enable" : "text-disable"}>ShowHide</button>
                <button onClick={() => setPaste   (!paste   )} className={paste    ? "text-enable" : "text-disable"}>Paste</button>
            </div>
        </>
    );
}
