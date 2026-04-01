import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { getAppdataDirFile, Paths } from "~/util/path";
import { HotkeyMainKeys } from "./Flintia";

export default class Config {
    passfile = "";
    authfile = "";
    imagedir = "";

    hotkey_shift = true;
    hotkey_ctrl = true;
    hotkey_alt = true;
    hotkey_win = false;
    hotkey_main = "Q" as HotkeyMainKeys;

    theme: string = "Default_Dark";

    private static async getFile() {
        return await getAppdataDirFile("config.json");
    }

    public static async load() {
        const path = await Config.getFile();
        if (await Paths.notExists(path)) {
            await writeTextFile(path, JSON.stringify(new Config(), undefined, 4));
        }
        const raw = await readTextFile(path);
        const json = JSON.parse(raw);
        const conf: Config = Object.assign(new Config(), json);
        return conf;
    }

    public async save() {
        const path = await Config.getFile();
        await writeTextFile(path, JSON.stringify(this, undefined, 4));
    }
}
