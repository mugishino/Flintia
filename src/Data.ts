import { desktopDir, homeDir } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";

export const IS_DEVELOP_MODE = process.env.NODE_ENV == "development";
export const DESKTOP_DIR = await desktopDir();
export const HOME_DIR = await homeDir();

export const CommandExists = {
    FFmpeg: await Command.create("where", ["ffmpeg"]).execute().then(v => v.code == 0).catch(() => false),
} as const;

export const DefaultFileName = {
    Input: "i.",
    Output: "o.",
}
