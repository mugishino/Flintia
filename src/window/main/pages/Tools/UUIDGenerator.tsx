import { useState } from "react";
import { Clipboards } from "~/util/clipboard";

export function UUIDGenerator() {
    const [uuidView, setUUID] = useState(crypto.randomUUID());
    return (
        <button
            title="左クリでコピー | 右クリでハイフンなしをコピー"
            onMouseDown={e => {
                // 2 is mouse-right
                Clipboards.copyText(e.button != 2 ? uuidView : uuidView.replace(/-/g, String.empty));
                setUUID(crypto.randomUUID());
            }}
        >{uuidView}</button>
    );
}
