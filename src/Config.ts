import { HotkeyMainKeys } from "./Flintia";
import { Savedata, SaveFile } from "./module/SaveFile";

class Config implements Savedata {
    filename = "config.json";

    passfile = "";
    authfile = "";
    imagedir = "";

    hotkey_shift = true;
    hotkey_ctrl = true;
    hotkey_alt = true;
    hotkey_win = false;
    hotkey_main = "Q" as HotkeyMainKeys;

    theme: string = "Default_Dark";

    enable_launcher = true;
}

export const flintiaConfig = await SaveFile.load(new Config());
