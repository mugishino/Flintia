import { appDataDir } from "@tauri-apps/api/path";
import { exists, mkdir, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export class SaveData {
    title       = "";
    username    = "";
    mail        = "";
    password    = "";
    note        = "";
}

async function notExists(path: string) {
    return !(await exists(path));
}

async function getSaveFile() {
    const dir = await appDataDir();
    if (await notExists(dir)) {
        await mkdir(dir);
    }
    return dir+"\\password.json";
}

export async function dataload() {
    const path = await getSaveFile();
    if (await notExists(path)) {
        // ファイル作成
        await writeTextFile(path, JSON.stringify([new SaveData()]));
        return [];
    }

    const raw = await readTextFile(path);
    const json: Object[] = JSON.parse(raw);
    const result: SaveData[] = json.map(v => Object.assign(new SaveData(), v));
    return result;
}
