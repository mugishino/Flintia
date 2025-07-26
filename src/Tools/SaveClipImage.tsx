import { desktopDir } from "@tauri-apps/api/path";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { useState } from "react";
import { getClipboardImageBlob } from "~/util";

export default function SaveClipImage() {
    const [errMsg, setErrMsgRaw] = useState<string|null>(null);
    function setErrorMessage(text: string) {
        setErrMsgRaw(text);
        setTimeout(() => {
            setErrMsgRaw(null);
        }, 1000);
    }

    async function onSaveButtonClick() {
        const blob = await getClipboardImageBlob();
        if (blob == null) return setErrorMessage("クリップボードが画像ではありません。");

        const desktopPath = await desktopDir();
        const savePath = await save({
            defaultPath: `${desktopPath}/${Date.now()}.png`,
            title: "名前を付けて保存",
            filters: [{
                "extensions": ["png"],
                "name": "Image",
            }],
        });
        if (savePath == null) return;

        const buffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(buffer);
        await writeFile(savePath, uint8Array);
    }

    return <button onClick={onSaveButtonClick} className={errMsg ? "text-fail" : undefined}>{errMsg || "名前を付けて保存"}</button>;
}
