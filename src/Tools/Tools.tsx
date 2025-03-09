import { useState } from "react";
import css from "./Tools.module.css";

export default function Tools() {
    const [uuidView, setUUID] = useState(crypto.randomUUID());

    return (
        <>
            <div className={css.tool}>
                <div className={css.title}>
                    <span>UUID Generator</span>
                    <button className={css.button} onClick={() => setUUID(crypto.randomUUID())}>Refresh</button>
                </div>
                <div onClick={() => navigator.clipboard.writeText(uuidView)} className={css.button}>{uuidView}</div>
                {(() => {
                    const str = uuidView.replace(/-/g, "");
                    return <div onClick={() => navigator.clipboard.writeText(str)} className={css.button}>{str}</div>;
                })()}
            </div>
        </>
    );
}
