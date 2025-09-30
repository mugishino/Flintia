import { appDataDir } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";

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
