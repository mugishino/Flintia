import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { getAppdataDirFile, notExists } from "~/util";

export default class Config {
    passfile = "";
    authfile = "";

    private static async getFile() {
        return await getAppdataDirFile("config.json");
    }

    public static async init() {
        const file = await Config.getFile();
        if (await notExists(file)) {
            await writeTextFile(file, JSON.stringify(new Config(), undefined, 4));
        }
    }

    public static async load() {
        const path = await Config.getFile();
        const raw = await readTextFile(path);
        const json = JSON.parse(raw);
        const conf: Config = Object.assign(new Config(), json);
        return conf;
    }
}
