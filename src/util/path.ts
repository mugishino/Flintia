import { appDataDir } from "@tauri-apps/api/path";
import { exists, mkdir } from "@tauri-apps/plugin-fs";
import { WInvoke } from "~/InvokeWrapper";


/**
 * このアプリのデータディレクトリのファイルを取得します。
 * ディレクトリは自動で作成されます。
 * @param filename 取得するファイル名
 * @returns Appdata/filename
 */
export async function getAppdataDirFile(filename: string) {
    const appdata = await appDataDir();
    await mkdir(appdata, {recursive: true});
    return appdata + "/" + filename;
}

/**
 * このアプリのデータディレクトリのディレクトリを取得します。
 * そのディレクトリは自動で作成されます。
 * @param dirname 取得するディレクトリ名
 * @returns Appdata/dirname/
 */
export async function getAppdataDirDir(dirname: string) {
    const appdata = await appDataDir();
    const fullpath = appdata + "/" + dirname + "/";
    await mkdir(fullpath, {recursive: true});
    return fullpath;
}

/**
 * このアプリのキャッシュディレクトリのファイルを取得します。
 * キャッシュディレクトリは自動で作成されます。
 * @param filename 取得するファイル名
 * @returns Appdata/cache/filename
 */
export async function getCacheDirFile(filename: string) {
    const dir = await getAppdataDirFile("cache/");
    return dir + filename;
}

/**
 * このアプリのキャッシュディレクトリのディレクトリを取得します。
 * そのディレクトリは自動で作成されます。
 * @param dirname 取得するディレクトリ名
 * @returns Appdata/cache/dirname/
 */
export async function getCacheDirDir(dirname: string) {
    const fullpath = "cache/" + dirname;
    const dir = await getAppdataDirDir(fullpath);
    return dir;
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
