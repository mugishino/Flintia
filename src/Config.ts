import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { getAppdataDirFile, notExists } from "~/util";

export default class Config {
    passfile = "";
    authfile = "";

    private static async getFile() {
        return await getAppdataDirFile("config.json");
    }

    public static async load() {
        const path = await Config.getFile();
        if (await notExists(path)) {
            await writeTextFile(path, JSON.stringify(new Config(), undefined, 4));
        }
        const raw = await readTextFile(path);
        const json = JSON.parse(raw);
        const conf: Config = Object.assign(new Config(), json);
        return conf;
    }
}
