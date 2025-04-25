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
            <div className={css.notifis}>{notify}</div>
            <div className={css.tool}>
                <div className={css.title}>UUID Generator</div>
                {(() => {
                    function uuidCopyAndRefresh(hyphen: boolean) {
                        copyText(hyphen ? uuidView : uuidView.replace(/-/g, ""));
                        setUUID(crypto.randomUUID());
                    }
                    return <div title="click to copy, right click to copy without hyphens"
                        className={css.button}
                        onMouseDown={e => uuidCopyAndRefresh(e.button != 2)} // 2 is mouse-right
                    >{uuidView}</div>
                })()}
            </div>
        </>
    );
}
