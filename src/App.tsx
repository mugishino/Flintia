import React, { useEffect, useState } from "react";
import { dataload } from "./FileSys";
import css from "./App.module.css";

export default function App() {
    const [view, setView] = useState<React.JSX.Element[]>([]);

    useEffect(() => {
        const result: React.JSX.Element[] = [];
        dataload().then(data => {
            data.forEach((v, i) => {
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
    }, []);

    return (
        <>
            <input className={css.search} type="text" placeholder="search"/>
            <div className={css.main}>{view}</div>
        </>
    );
}
