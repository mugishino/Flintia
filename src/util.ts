import { appDataDir } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";
import { useEffect } from "react";

export async function notExists(path: string) {
    return !(await exists(path));
}

export async function getAppdataDirFile(filename: string) {
    const dir = await appDataDir();
    if (await notExists(dir)) {
        await mkdir(dir);
    }
    return dir+"\\"+filename;
}

// tailwindとcss modulesの結合用関数
export function cls(...args: (string|null|undefined)[]) {
    return args.join(" ");
}

export function useEffectAsync(effect: () => Promise<void>, deps?: React.DependencyList) {
    useEffect(() => {effect()}, deps);
}

export function stringInject(base: string, inject: string, pos: number) {
    const x = base.slice(0, pos);
    const y = base.slice(pos);
    return x + inject + y;
}
