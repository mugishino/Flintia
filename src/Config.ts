import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { getAppdataDirFile, notExists } from "./util";

export class ConfigData {
    passfile = "";
}


async function getConfigFile() {
    return await getAppdataDirFile("config.json");
}

export async function initConfig() {
    const file = await getConfigFile();
    if (await notExists(file)) {
        await writeTextFile(file, JSON.stringify(new ConfigData(), undefined, 4));
    }
}

export async function loadConfig() {
    const path = await getConfigFile();
    const raw = await readTextFile(path);
    const json = JSON.parse(raw);
    const conf: ConfigData = Object.assign(new ConfigData(), json);
    return conf;
}
