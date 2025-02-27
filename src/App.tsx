import React, { useEffect, useState } from "react";
import { dataload } from "./SaveFs";
import css from "./App.module.css";

function copy(text: string) {
    navigator.clipboard.writeText(text);
}

export default function App() {
    const [view, setView] = useState<React.JSX.Element[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const result: React.JSX.Element[] = [];
        dataload().then(data => {
            data.sort((a, b) => a.title.localeCompare(b.title)) // A-Zでソート
            .forEach((v, i) => {
                if (search != "" && !v.title.toLowerCase().startsWith(search.toLowerCase())) return;
                result.push(
                    <details className={[css.title, css.hover].join(" ")} key={i} tabIndex={-1}>
                        <summary>{v.title}</summary>
                        {!v.username || <div className={[css.hover, css.click].join(" ")} title="Click To Copy" onClick={() => copy(v.username)}>UserName</div>}
                        {!v.mail     || <div className={[css.hover, css.click].join(" ")} title="Click To Copy" onClick={() => copy(v.mail)}>Mail Address</div>}
                        {!v.password || <div className={[css.hover, css.click].join(" ")} title="Click To Copy" onClick={() => copy(v.password)}>Password</div>}
                        <div className={css.note}>{v.note}</div>
                    </details>
                );
            });
            setView(result);
        });
    }, [search]);

    return (
        <>
            <input autoFocus className={css.search} onChange={e=>setSearch(e.currentTarget.value)} type="text" placeholder="search"/>
            <div className={css.main}>{view}</div>
        </>
    );
}
