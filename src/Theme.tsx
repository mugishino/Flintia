import { mkdir } from "@tauri-apps/plugin-fs";
import { getAppdataDirFile, Paths } from "./util/path";
import { flintiaConfig } from "./Config";
import { convertFileSrc } from "@tauri-apps/api/core";

// init
const themesDir = await getAppdataDirFile("themes/");
if (await Paths.notExists(themesDir)) {
    mkdir(themesDir);
}
ReloadTheme();

export async function ReloadTheme() {
    const theme = flintiaConfig.read().theme;
    const themeFile = await getAppdataDirFile("themes/"+theme);
    const notExists = await Paths.notExists(themeFile);

    const linkElem = document.getElementById("theme") as HTMLLinkElement;
    linkElem.href = notExists ? String.empty : convertFileSrc(themeFile);
}
