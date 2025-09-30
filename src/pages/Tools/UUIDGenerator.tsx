import { useState } from "react";
import { copyText } from "~/util/clipboard";

export default function UUIDGenerator() {
    const [uuidView, setUUID] = useState(crypto.randomUUID());
    return (
        <button
            title="左クリでコピー | 右クリでハイフンなしをコピー"
            onMouseDown={e => {
                // 2 is mouse-right
                copyText(e.button != 2 ? uuidView : uuidView.replace(/-/g, String.empty));
                setUUID(crypto.randomUUID());
            }}
        >{uuidView}</button>
    );
}
