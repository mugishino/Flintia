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
    return dir+"\\save.json";
}

export default class FileSys {
    public static async save(data: SaveData[]) {
        const json = JSON.stringify(data);
        await writeTextFile(await getSaveFile(), json);
    }

    public static async load() {
        const path = await getSaveFile();
        if (await notExists(path)) {
            return [];
        }

        const raw = await readTextFile(path);
        const json: Object[] = JSON.parse(raw);
        const result: SaveData[] = json.map(v => Object.assign(new SaveData(), v));
        return result;
    }
}
