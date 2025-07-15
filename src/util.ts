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

// tailwindとcss modulesの結合用関数
export function cls(...args: (string|null|undefined)[]) {
    return args.join(String.space);
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

export function getBasename(file: string) {
    return file.split("\\").slice(-1)[0].split("/").slice(-1)[0];
}
