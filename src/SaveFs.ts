import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { getAppdataDirFile, notExists } from "./util";

export class SaveData {
    title       = "";
    username    = "";
    mail        = "";
    password    = "";
    note        = "";
    hide        = false;
}

async function getSaveFile() {
    return await getAppdataDirFile("password.json");
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
