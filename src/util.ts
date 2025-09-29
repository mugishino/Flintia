import { appDataDir } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";
import { WInvoke } from "./InvokeWrapper";

export async function notExists(path: string) {
    return !(await exists(path));
}

export async function getAppdataDirFile(filename: string) {
    const dir = await appDataDir();
    if (await notExists(dir)) {
        await mkdir(dir, {recursive: true});
    }
    return dir+"\\"+filename;
}

export function useEffectAsync(effect: () => Promise<void>, deps?: React.DependencyList) {
    useEffect(() => {effect()}, deps);
}

export function copyText(text: string|number, paste: boolean=false) {
    navigator.clipboard.writeText(text.toString());
    if (paste) {
        WInvoke.hide();
        WInvoke.paste();
    }
}

export function useUpdateRender() {
    const [value, setValue] = useState(false);
    return () => setValue(!value);
}

/**
 * ClipboardItemが画像か判定します。
 * @param item 判定するClipboardItem
 * @returns 画像のMIMEタイプ, 画像でなければundefined
 */
export function getImageMimeByClipboardImage(item: ClipboardItem) {
    const itemType = item.types.find(t => [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/tiff",
        "image/bmp",
    ].includes(t));
    return itemType;
}

export async function getClipboardImageBlob() {
    const item = (await navigator.clipboard.read())[0];
    const mime = getImageMimeByClipboardImage(item);
    if (!mime) return null;
    return await item.getType(mime);
}

export function getBasename(file: string) {
    return file.split("\\").get(-1).split("/").get(-1);
}

export function splitExt(filename: string) {
    const split = filename.split(".");
    const ext = split.splice(-1)[0];
    const name = split.join(".");
    return {
        name: name,
        ext: ext,
    };
}
