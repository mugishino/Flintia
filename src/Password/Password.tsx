import React, { useState } from "react";
import css from "./Password.module.css";
import Config from "~/Config";
import { cls, copyText, notExists, useEffectAsync } from "~/util";
import { readTextFile } from "@tauri-apps/plugin-fs";

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
    const json: Object[] = JSON.parse(raw);
    const result: PassRecord[] = json.map(v => Object.assign(new PassRecord(), v));
    return result;
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
    view.forEach((v, i) => {
        if (v.hide && !showHide) return;
        if (search != String.empty && !v.title.toLowerCase().startsWith(search.toLowerCase())) return;
        result.push(
            <details className={cls(css.title, css.hover)} key={i} tabIndex={-1}>
                <summary className={`list-none ${v.hide ? "text-text-gray" : undefined}`}>{v.title}</summary>
                {!v.username || <div className={cls(css.hover, css.click)} title="Click To Copy" onClick={() => copyText(v.username, true)}>UserName</div>}
                {!v.mail     || <div className={cls(css.hover, css.click)} title="Click To Copy" onClick={() => copyText(v.mail    , true)}>Mail Address</div>}
                {!v.password || <div className={cls(css.hover, css.click)} title="Click To Copy" onClick={() => copyText(v.password, true)}>Password</div>}
                {v.note == String.empty ||
                <details className={cls(css.title, css.hover)}>
                    <summary>[Note]</summary>
                    {v.note}
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
            <div className={css.setting}>
                <button onClick={() => setShowHide(!showHide)} className={showHide ? css.enable : undefined}>ShowHide</button>
            </div>
        </>
    );
}
