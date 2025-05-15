import { readTextFile } from "@tauri-apps/plugin-fs";
import { notExists } from "~/util";
import { loadConfig } from "~/Config";

export class PassRecord {
    title       = "";
    username    = "";
    mail        = "";
    password    = "";
    note        = "";
    hide        = false;
}

export async function getPassRecords() {
    const path = (await loadConfig()).passfile;
    if (path == "" || await notExists(path)) {
        return [];
    }

    const raw = await readTextFile(path);
    const json: Object[] = JSON.parse(raw);
    const result: PassRecord[] = json.map(v => Object.assign(new PassRecord(), v));
    return result;
}
