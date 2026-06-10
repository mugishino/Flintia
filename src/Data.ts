import { desktopDir, homeDir } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/plugin-shell";
import { SessionData } from "./util/session";

export const IS_DEVELOP_MODE = process.env.NODE_ENV == "development";
export const DESKTOP_DIR = await desktopDir();
export const HOME_DIR = await homeDir();

/** アプリ起動時かどうか。F5後はfalseになります。 */
export const IS_INITIAL = SessionData.setIfAbsent("APP_INITIALIZED", true);
// BUG: 初期化順の問題により使用不可。対応予定。
// export const IS_INITIAL = await WInvoke.isInitial();

export const CommandExists = {
    FFmpeg: await Command.create("where", ["ffmpeg"]).execute().then(v => v.code == 0).catch(() => false),
} as const;

export const DefaultFileName = {
    Input: "i.",
    Output: "o.",
}
