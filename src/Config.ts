import { HotkeyMainKeys } from "./Flintia";
import { AppSavedata } from "./AppStorage";

export default class Config implements AppSavedata {
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
