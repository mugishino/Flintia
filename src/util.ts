import { appDataDir } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";

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
export function cls(...args: string[]) {
    return args.join(" ");
}
