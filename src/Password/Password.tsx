import React, { useEffect, useState } from "react";
import css from "./Password.module.css";
import { WInvoke } from "~/InvokeWrapper";
import { loadConfig } from "~/Config";
import { notExists } from "~/util";
import { readTextFile } from "@tauri-apps/plugin-fs";

class PassRecord {
    title       = "";
    username    = "";
    mail        = "";
    password    = "";
    note        = "";
    hide        = false;
}

async function getPassRecords() {
    const path = (await loadConfig()).passfile;
    if (path == "" || await notExists(path)) {
        return [];
    }

    const raw = await readTextFile(path);
    const json: Object[] = JSON.parse(raw);
    const result: PassRecord[] = json.map(v => Object.assign(new PassRecord(), v));
    return result;
}



function copy(text: string) {
    navigator.clipboard.writeText(text);
    WInvoke.hide();
    WInvoke.paste();
}

export default function App() {
    const [view, setView] = useState<React.JSX.Element[]>([]);
    const [search, setSearch] = useState("");

    // setting
    const [showHide, setShowHide] = useState(false);

    useEffect(() => {
        const result: React.JSX.Element[] = [];
        getPassRecords().then(data => {
            data.sort((a, b) => a.title.localeCompare(b.title)) // A-Zでソート
            .forEach((v, i) => {
                if (v.hide && !showHide) return;
                if (search != "" && !v.title.toLowerCase().startsWith(search.toLowerCase())) return;
                result.push(
                    <details className={[css.title, css.hover].join(" ")} key={i} tabIndex={-1}>
                        <summary className={v.hide ? css.showHide : undefined}>{v.title}</summary>
                        {!v.username || <div className={[css.hover, css.click].join(" ")} title="Click To Copy" onClick={() => copy(v.username)}>UserName</div>}
                        {!v.mail     || <div className={[css.hover, css.click].join(" ")} title="Click To Copy" onClick={() => copy(v.mail)}>Mail Address</div>}
                        {!v.password || <div className={[css.hover, css.click].join(" ")} title="Click To Copy" onClick={() => copy(v.password)}>Password</div>}
                        {v.note == "" || <details className={[css.title, css.hover].join(" ")}>
                            <summary>[Note]</summary>
                            {v.note}
                        </details>}
                    </details>
                );
            });
            setView(result);
        });
    }, [search, showHide]);

    return (
        <>
            <input autoFocus className={css.search} onChange={e=>setSearch(e.currentTarget.value)} type="text" placeholder="search"/>
            <div className={css.main}>{view}</div>
            <div className={css.setting}>
                <button onClick={() => setShowHide(!showHide)} className={showHide ? css.enable : undefined}>ShowHide</button>
            </div>
        </>
    );
}
