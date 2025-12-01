import { Command } from "@tauri-apps/plugin-shell";

export const CommandExists = {
    FFmpeg: await Command.create("where", ["ffmpeg"]).execute().then(v => v.code == 0).catch(() => false),
} as const;

export const DefaultFileName = {
    Input: "i.",
    Output: "o.",
}
