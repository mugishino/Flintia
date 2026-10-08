import { useState } from "react";
import { Clipboards } from "~/util/clipboard";
import { parseMouseButtons } from "~/util/util";

export function UUIDGenerator() {
    const [uuidView, setUUID] = useState(crypto.randomUUID());
    return (
        <button
            title={"Left: Copy\nRight: Copy without hyphens\nWheel: Reroll"}
            onMouseDown={e => {
                const button = parseMouseButtons(e);
                if (button.middle) {
                    e.preventDefault();
                }
                if (button.left || button.right) {
                    Clipboards.copyText(button.left ? uuidView : uuidView.replace(/-/g, String.empty));
                }
                setUUID(crypto.randomUUID());
            }}
        >{uuidView}</button>
    );
}
