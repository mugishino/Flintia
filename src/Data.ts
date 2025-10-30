import { WInvoke } from "~/InvokeWrapper";

export const CommandExists = {
    FFmpeg: await WInvoke.commandExists("ffmpeg"),
} as const;

export const DefaultFileName = {
    Input: "i.",
    Output: "o.",
}
