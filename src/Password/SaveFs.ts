import { readTextFile } from "@tauri-apps/plugin-fs";
import { notExists } from "~/util";
import { loadConfig } from "~/Config";

export class SaveData {
    title       = "";
    username    = "";
    mail        = "";
    password    = "";
    note        = "";
    hide        = false;
}

async function getSaveFile() {
    const conf = await loadConfig();
    return conf.passfile;
}

export async function dataload() {
    const path = await getSaveFile();
    if (path == "" || await notExists(path)) {
        return [];
    }

    const raw = await readTextFile(path);
    const json: Object[] = JSON.parse(raw);
    const result: SaveData[] = json.map(v => Object.assign(new SaveData(), v));
    return result;
}
