import { useState } from "react";
import { CellData, CellObj } from "./CellObj";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { getAppdataDirFile, Paths } from "~/util/path";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

type TileData = {
    type: "tile"|"label"
    label: string;
    exe?: string;
    args?: string;
} & CellData;

type SaveData = Map<string, TileData>;



function Tile(props: {data: TileData, onClick: () => void, onMove: (x: number, y: number) => void}) {
    return (
        <CellObj data={props.data} onClick={props.onClick} onMoved={props.onMove} movable={true}>
            <div className="bg-blue-500 h-full w-full relative active:bg-blue-600 hover:outline-3 outline-blue-400 active:outline-0 -outline-offset-3">
                {props.data.w+props.data.h != 2 && <span className="absolute bottom-0 text-[75%] pl-0.5">{props.data.label}</span>}
            </div>
        </CellObj>
    );
}

function Label(props: {data: TileData, onClick?: () => void, onMove?: (x: number, y: number) => void, movable: boolean, center?: boolean}) {
    return (
        <CellObj data={props.data} onClick={props.onClick} onMoved={props.onMove} movable={props.movable}>
            <div className="bg-auth-hover hover:bg-auth-accent-hover h-full w-full">
                <span className="h-full flex items-center" style={{
                    justifyContent: "center".where(props.center == true),
                    marginLeft: "0.5rem".where(props.center == false),
                }}>{props.data.label}</span>
            </div>
        </CellObj>
    );
}



const datafile = await getAppdataDirFile("launcher.json");

export default function LaunchPanel() {
    const [savedata, setSavedata] = useState<SaveData>(new Map());

    useEffectAsync(async() => {
        if (await Paths.notExists(datafile)) return;
        // load
        const rawDataString = await readTextFile(datafile);
        const rawData = JSON.parse(rawDataString);
        // set
        const map: SaveData = new Map(Object.entries(rawData));
        setSavedata(map);
    }, []);

    /**
     * オブジェクト移動時に使用
     * @param k オブジェクトキー
     * @param v 古い値
     * @param x 新しいグリッドX座標
     * @param y 新しいグリッドY座標
     */
    async function moveObject(k: string, v: TileData, x: number, y: number) {
        // reactデータ更新
        const newData = new Map(savedata);
        v.x = x;
        v.y = y;
        newData.set(k, v);
        setSavedata(newData);

        // 保存
        const json = JSON.stringify(Object.fromEntries(newData));
        await writeTextFile(datafile, json);
    }



    return (
        <div className="h-full w-full overflow-x-hidden overflow-y-scroll p-12">
            <Label data={{type: "label", label: "+", x: 0.1, y: 0.1, w: 1, h: 1}} movable={false} center={true} onClick={async() => {
                await moveObject(
                    crypto.randomUUID(),
                    {x: 0, y: -1, w: 1, h: 1, type: "tile", label: String.empty},
                    0, -1
                );
            }}/>
            <div className="w-full h-full relative">
                {savedata && savedata.map((k, v) => {
                    switch (v.type) {
                        case "tile":
                            return <Tile key={k} data={v} onClick={() => {}} onMove={async(x, y) => await moveObject(k, v, x, y)}/>
                        case "label":
                            return <Label key={k} data={v} onMove={async(x, y) => await moveObject(k, v, x, y)} movable={true}></Label>
                    }
                })}
            </div>
        </div>
    );
}
