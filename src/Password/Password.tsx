import React, { useEffect, useState } from "react";
import { dataload, SaveData } from "./SaveFs";
import css from "./Password.module.css";
import { WInvoke } from "../InvokeWrapper";

function copy(text: string) {
    navigator.clipboard.writeText(text);
    WInvoke.hide();
    WInvoke.paste();
}

// ロジック側に組み込むと見づらいので分けました
function PasswordDetails(props: {savedata: SaveData, key: number}) {
    const v = props.savedata;
    return (
        <details className={[css.title, css.hover].join(" ")} key={props.key} tabIndex={-1}>
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
}

export default function App() {
    const [view, setView] = useState<React.JSX.Element[]>([]);
    const [search, setSearch] = useState("");

    // setting
    const [showHide, setShowHide] = useState(false);

    useEffect(() => {
        const result: React.JSX.Element[] = [];
        dataload().then(data => {
            data.sort((a, b) => a.title.localeCompare(b.title)) // A-Zでソート
            .forEach((data, i) => {
                if (data.hide && !showHide) return;
                if (search != "" && !data.title.toLowerCase().startsWith(search.toLowerCase())) return;
                result.push(<PasswordDetails savedata={data} key={i}/>);
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
