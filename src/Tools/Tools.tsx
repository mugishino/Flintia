import { useState } from "react";
import css from "./Tools.module.css";

export default function Tools() {
    const [notify, setNotify] = useState("");
    function showNotification(msg: string) {
        setNotify(msg);
        setTimeout(setNotify, 3000);
    }

    const [uuidView, setUUID] = useState(crypto.randomUUID());


    function copyText(text: string) {
        navigator.clipboard.writeText(text);
        showNotification("Copied!")
    }

    return (
        <>
            <div className={css.tool}>
                <div className={css.title}>
                    <span>UUID Generator</span>
                    <button className={css.button} onClick={() => setUUID(crypto.randomUUID())}>Refresh</button>
                </div>
                <div onClick={() => copyText(uuidView)} className={css.button}>{uuidView}</div>
                {(() => {
                    const str = uuidView.replace(/-/g, "");
                    return <div onClick={() => copyText(str)} className={css.button}>{str}</div>;
                })()}
            </div>
            <div className={css.notifis}>{notify}</div>
        </>
    );
}
