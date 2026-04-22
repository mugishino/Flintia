import { desktopDir } from "@tauri-apps/api/path";
import { writeFile } from "@tauri-apps/plugin-fs";
import { useState } from "react";
import { Clipboards } from "~/util/clipboard";
import { Dialogs } from "~/module/Dialogs";

export default function SaveClipImage() {
    const [errMsg, setErrMsgRaw] = useState<string|null>(null);
    function setErrorMessage(text: string) {
        setErrMsgRaw(text);
        setTimeout(() => {
            setErrMsgRaw(null);
        }, 1000);
    }

    async function onSaveButtonClick() {
        const blob = await Clipboards.getImageBlob();
        if (blob == null) return setErrorMessage("クリップボードが画像ではありません。");

        const desktopPath = await desktopDir();
        const savePath = await Dialogs.save("名前を付けて保存", [{name: "Image", extensions: ["png"]}], `${desktopPath}/${Date.now()}.png`);
        if (savePath == null) return;

        const buffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        await writeFile(savePath, uint8Array);
    }

    return <button onClick={onSaveButtonClick} className={errMsg ? "text-fail" : undefined}>{errMsg || "名前を付けて保存"}</button>;
}
