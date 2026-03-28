import { appDataDir } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";
import { WInvoke } from "~/InvokeWrapper";


export async function getAppdataDirFile(filename: string) {
    const dir = await appDataDir();
    if (await Paths.notExists(dir)) {
        await mkdir(dir, {recursive: true});
    }
    return dir+"\\"+filename;
}

export namespace Paths {
    export async function notExists(path: string) {
        return !(await exists(path));
    }

    export function getBasename(file: string) {
        return file.split("\\").get(-1).split("/").get(-1);
    }

    export function splitExt(filename: string) {
        const split = filename.split(".");
        const ext = split.splice(-1)[0];
        const name = split.join(".");
        // nameが0文字であればextとスワップ
        return name.length == 0 ? {name: ext, ext: name} : {name, ext};
    }

    export const isDirectory = WInvoke.isDirectory;
}
