import { useState } from "react";
import css from "./Tools.module.css";

export default function Tools() {
    const [uuidView, setUUID] = useState(crypto.randomUUID());

    return (
        <>
            <div className={css.tool}>
                UUID Generator
                <button onClick={() => setUUID(crypto.randomUUID())}>Refresh</button>
                <div className={css.uuid}>{uuidView}</div>
            </div>
        </>
    );
}
