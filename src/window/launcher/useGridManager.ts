import { useRef, useState } from "react";
import { CellData } from "./CellObj";
import { getAppdataDirFile, Paths } from "~/util/path";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

export type CellType = "tile" | "label";
export type SaveData = Map<string, TileData>;
export type TileData = {
    type: CellType;
    label: string;
    exe?: string;
    exe_icon?: string;
    args?: string;
    custom_icon?: string;
} & CellData;

export const DEFAULT_TILE_DATA: TileData = {
    h: 1, w: 1,
    x: 0, y: 0,
    label: String.empty,
    type: "tile",
    args: undefined,
    custom_icon: undefined,
    exe: undefined,
    exe_icon: undefined,
} as const;

const datafile = await getAppdataDirFile("launcher.json");

export function useGridManager() {
    const loaded = useRef(false);
    const [data, setData] = useState<SaveData>(new Map());

    // load
    useEffectAsync(async() => {
        if (await Paths.notExists(datafile)) {
            loaded.current = true;
            return;
        }
        // load
        const rawDataString = await readTextFile(datafile);
        const rawData = JSON.parse(rawDataString);
        // set
        const map: SaveData = new Map(Object.entries(rawData));
        setData(map);
        loaded.current = true;
    }, []);

    // save
    useEffectAsync(async() => {
        if (!loaded.current) return;
        const json = JSON.stringify(Object.fromEntries(data), undefined, 2);
        await writeTextFile(datafile, json);
    }, [data]);



    /**
     * データを更新します。オブジェクトが更新されます。
     * @param process データ更新処理。更新後のデータを返してください。
     */
    function updateData(process: (data: SaveData) => SaveData) {
        const newData = new Map(data);
        const result = process(newData);
        setData(result);
    }

    /**
     * オブジェクト移動時に使用
     * @param k オブジェクトキー
     * @param v 古い値
     * @param x 新しいグリッドX座標
     * @param y 新しいグリッドY座標
     */
    function moveObject(k: string, v: TileData, x: number, y: number) {
        // reactデータ更新
        updateData(newData => newData.set(k, {...v, x, y}));
    }

    /**
     * 新しいオブジェクトを追加する
     * @param type 追加するオブジェクト種
     */
    function addObject(
        type: CellType,
        label?: string,
        args?: string,
        custom_icon?: string,
        exe?: string,
        exe_icon?: string,
    ) {
        // 同じ位置にあればキャンセル
        if (Array.from(data.values()).filter(v => v.y == -1).length > 0) return;
        moveObject(
            crypto.randomUUID(),
            {h: 1, w: 1, x: 0, y: -1, label: label ?? String.empty, args, custom_icon, exe, exe_icon, type: type},
            0, -1,
        );
    }

    /**
     * オブジェクトを削除する
     * @param key 削除するオブジェクトのキー
     */
    function deleteObject(key: string) {
        updateData(newData => {
            newData.delete(key);
            return newData;
        });
    }

    /**
     * セルが重なっているか確認する
     * @param excludeKey 除外するセルのキー
     * @param celldata 重なっているか確認するセルのデータ
     * @returns 重なっていればtrue
     */
    function isOverlapping(excludeKey: string, celldata: CellData) {
        const array = data.map((k, v) => {
            if (k == excludeKey) return;
            return v;
        }).filter(v => !!v);
        // cache
        const top = celldata.y;
        const left = celldata.x;
        const right = celldata.x + celldata.w;
        const bottom = celldata.y + celldata.h;

        const filterd = array.filter(v => {
            return (
                top    < v.y + v.h && // 上端がvの下端より上
                left   < v.x + v.w && // 左端がvの右端より左
                right  > v.x && // 右端がvの左端より右
                bottom > v.y    // 下端がvの上端より下
            );
        });
        return filterd.length > 0;
    }

    return {
        data,
        updateData,
        addObject,
        moveObject,
        deleteObject,
        isOverlapping,
    };
}
