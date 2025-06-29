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

export function stringInject(base: string, inject: string, pos: number) {
    const x = base.slice(0, pos);
    const y = base.slice(pos);
    return x + inject + y;
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
