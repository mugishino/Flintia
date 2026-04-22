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
        return file.split("\\").get(-1)?.split("/").get(-1) ?? String.empty;
    }

    export function splitExt(filename: string) {
        const split = filename.split(".");
        const ext = split.splice(-1)[0];
        const name = split.join(".");
        // nameが0文字であればextとスワップ
        return name.length == 0 ? {name: ext, ext: name} : {name, ext};
    }

    export function getDirectory(file: string) {
        return file.split("\\").slice(0, -1).join("\\")+"\\";
    }

    export function join(...paths: string[]) {
        const joined = paths
            // 空文字の削除とバックスラッシュ統一
            .filter(s => !!s)
            .map(s => s.replace(/\//g, "\\"))
            .join("\\");
        if (joined.length == 0) return String.empty;

        // ネットワークパス対応
        const isNetworkPath = joined.startsWith("\\\\");
        const duplicateFix = joined.replace(/\\+/g, "\\");
        return (isNetworkPath ? "\\" : String.empty) + duplicateFix;
    }

    export function equals(a: string, b: string) {
        const ra = a.toLocaleLowerCase().replace(/\//g, "\\");
        const rb = b.toLocaleLowerCase().replace(/\//g, "\\");
        return ra == rb;
    }

    export const isDirectory = WInvoke.isDirectory;
}
