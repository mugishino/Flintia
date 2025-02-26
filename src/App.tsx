import React, { useEffect, useState } from "react";
import { dataload } from "./FileSys";
import css from "./App.module.css";

export default function App() {
    const [view, setView] = useState<React.JSX.Element[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const result: React.JSX.Element[] = [];
        dataload().then(data => {
            data.forEach((v, i) => {
                if (search != "" && !v.title.toLowerCase().startsWith(search.toLowerCase())) return;
                result.push(
                    <details className={[css.title, css.hover].join(" ")} key={i}>
                        <summary>{v.title}</summary>
                        <div className={css.hover}>{v.username}</div>
                        <div className={css.hover}>{v.mail}</div>
                        <div className={css.hover}>{v.password}</div>
                        <div className={css.note}>{v.note}</div>
                    </details>
                );
            });
            setView(result);
        });
    }, [search]);

    return (
        <>
            <div className={css.close}>CLOSE</div>
            <input className={css.search} onChange={e=>setSearch(e.currentTarget.value)} type="text" placeholder="search"/>
            <div className={css.main}>{view}</div>
        </>
    );
}
