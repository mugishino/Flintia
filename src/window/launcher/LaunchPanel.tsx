import { useState } from "react";
import { CellData, CellObj, CellObjProps } from "./CellObj";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { getAppdataDirFile, Paths } from "~/util/path";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import Overlay from "~/components/Overlay";
import Setting from "~/components/Setting";
import { open } from "@tauri-apps/plugin-dialog";
import { FlintiaWindow } from "~/Flintia";
import { WInvoke } from "~/InvokeWrapper";
import { useStaticOverlay } from "~/hooks/useOverlay";

type CellType = "tile" | "label";
type SaveData = Map<string, TileData>;
type TileData = {
    type: CellType;
    label: string;
    exe?: string;
    args?: string;
} & CellData;




function Tile(props: CellObjProps & TileData) {
    const [img, setImg] = useState<string|undefined>(undefined);

    useEffectAsync(async() => {
        if (!props.exe) return;
        const b64 = await WInvoke.getFileIconBase64(props.exe, 64);
        setImg(b64);
    }, [props.exe]);

    return (
        <CellObj {...props}>
            <div className="bg-blue-500 h-full w-full relative active:bg-blue-600 hover:outline-3 outline-blue-400 active:outline-0 -outline-offset-3">
                <div className="flex justify-center items-center h-full w-full">
                    {img && <img className="h-full w-full max-w-14 p-1 object-contain" src={"data:image/png;base64," + img}/>}
                </div>
                {props.w > 1 && <span className="absolute bottom-0 text-[75%] pl-0.5">{props.label}</span>}
            </div>
        </CellObj>
    );
}

function Label(props: {center?: boolean} & CellObjProps & TileData) {
    const {center, ...rest} = props;
    return (
        <CellObj {...rest}>
            <div className="bg-auth-hover hover:bg-auth-accent-hover h-full w-full">
                <span className="h-full flex items-center" style={{
                    justifyContent: "center".where(!!center),
                    marginLeft: "0.3rem".where(!center),
                }}>{props.label}</span>
            </div>
        </CellObj>
    );
}

function NumberSelector(props: {min: number, max: number, value: number, label: string, onChange: (v: number) => void}) {
    return (
        <div className="flex flex-row justify-between p-1">
            <button className="w-8" onClick={() => props.onChange((props.value-1).keepRange(props.min, props.max))}>-</button>
            <div className="m-auto">{props.label}: {props.value}</div>
            <button className="w-8" onClick={() => props.onChange((props.value+1).keepRange(props.min, props.max))}>+</button>
        </div>
    );
}



const datafile = await getAppdataDirFile("launcher.json");

export default function LaunchPanel() {
    const [loaded, setLoaded] = useState(false);
    const [data, setData] = useState<SaveData>(new Map());
    const [overlay, showOverlay] = useState(false);
    const [deleteOverlay, setDeleteOverlay] = useStaticOverlay();
    // settings
    const [settingKey, setSettingKey] = useState(String.empty);
    const [height, setHeight] = useState(0);
    const [width, setWidth] = useState(0);
    const [label, setLabel] = useState(String.empty);
    const [exe, setExe] = useState<string|undefined>(undefined);
    const [args, setArgs] = useState<string|undefined>(undefined);
    const [isDir, setIsDir] = useState(false);

    useEffectAsync(async() => {
        if (await Paths.notExists(datafile)) return;
        // load
        const rawDataString = await readTextFile(datafile);
        const rawData = JSON.parse(rawDataString);
        // set
        const map: SaveData = new Map(Object.entries(rawData));
        setData(map);
        setLoaded(true);
    }, []);

    useEffectAsync(async() => {
        if (!loaded) return;
        // 保存
        const json = JSON.stringify(Object.fromEntries(data));
        await writeTextFile(datafile, json);
    }, [data]);

    /**
     * オブジェクト移動時に使用
     * @param k オブジェクトキー
     * @param v 古い値
     * @param x 新しいグリッドX座標
     * @param y 新しいグリッドY座標
     */
    function moveObject(k: string, v: TileData, x: number, y: number) {
        // reactデータ更新
        const newData = new Map(data);
        v.x = x;
        v.y = y;
        newData.set(k, v);
        setData(newData);
    }

    /**
     * 新しいオブジェクトを追加する
     * @param type 追加するオブジェクト種
     */
    function addObject(type: CellType) {
        // 同じ位置にあればキャンセル
        if (Array.from(data.values()).filter(v => v.y == -1).length > 0) return;
        moveObject(
            crypto.randomUUID(),
            {x: 0, y: -1, w: 1, h: 1, type: type, label: String.empty},
            0, -1,
        );
    }

    function deleteObject(key: string) {
        const newData = new Map(data);
        newData.delete(key);
        setData(newData);
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

    /**
     * セルの設定を開きます。
     * @param k 設定を開くセルのキー
     */
    async function openCellSetting(k: string) {
        const v = data.get(k);
        if (!v) return;
        // 設定画面を更新
        setSettingKey(k);
        setLabel(v.label);
        setHeight(v.h);
        setWidth(v.w);
        setExe(v.exe);
        setArgs(v.args);
        setIsDir(v.exe ? await WInvoke.isDirectory(v.exe) : false);
        // 表示
        showOverlay(true);
    }

    async function selectExe(directory: boolean) {
        const select = await open({
            title: "Select open " + directory ? "directory" : "file",
            multiple: false,
            filters: [{
                extensions: ["*"],
                name: "Executionable",
            }],
            directory: directory,
        });
        const win = await FlintiaWindow.getCurrentWindow();
        win.show();

        if (select == null) return;
        setExe(select);
    }



    const settingOpenCellData = data.get(settingKey);

    return (
        <div className="h-full w-full overflow-x-hidden overflow-y-scroll p-12">
            <Label
                {...{type: "label", label: "+", x: 0.1, y: 0.1, w: 1, h: 1}}
                locked={true}
                center={true}
                onClick={() => addObject("tile")}
                onRightClick={() => addObject("label")}
            />
            <div className="w-full h-full relative">
                {data && data.map((k, v) => {
                    switch (v.type) {
                        case "tile":
                            const label = (() => {
                                if (v.label) return v.label;
                                const basename = Paths.getBasename(v.exe ?? String.empty);
                                const split = Paths.splitExt(basename);
                                return split.name;
                            })();
                            return <Tile  key={k} {...v} isOverlapping={v => isOverlapping(k, v)} onMoved={(x, y) => moveObject(k, v, x, y)} onRightClick={async() => openCellSetting(k)} label={label} onClick={async() => {
                                if (!v.exe) return;
                                await WInvoke.runExe(v.exe, v.args);
                            }}/>
                        case "label":
                            return <Label key={k} {...v} isOverlapping={v => isOverlapping(k, v)} onMoved={(x, y) => moveObject(k, v, x, y)} onRightClick={async() => openCellSetting(k)}/>
                    }
                })}
            </div>
            <Overlay show={overlay} setShow={showOverlay} grayBackground={false}>
                <div className="h-full w-full flex items-center justify-center">
                    <div className="bg-layerA p-4 gap-1 flex flex-col w-1/4 text-[0.75rem]" onClick={e => e.stopPropagation()}>
                        <input placeholder="Label" type="text" value={label} onChange={e => setLabel(e.currentTarget.value)}/>
                        <NumberSelector min={1} max={8} value={height} label="Height" onChange={v => setHeight(v)}/>
                        <NumberSelector min={1} max={8} value={width} label="Width" onChange={v => setWidth(v)}/>
                        <hr/>
                        {settingOpenCellData?.type == "tile" && <>
                            <Setting title="Oepn">
                                <div className="flex flex-row">
                                    <button onClick={async() => selectExe(false)}>file</button>
                                    <button onClick={async() => selectExe(true)}>directory</button>
                                </div>
                            </Setting>
                            {exe}
                            {exe && !isDir && <input placeholder="Arguments" value={args} onChange={e => setArgs(e.currentTarget.value)}/>}
                            <hr/>
                        </>}
                        <button onClick={() => {
                            const v = data.get(settingKey);
                            if (!v) return;
                            // 設定更新
                            v.label = label;
                            v.h = height;
                            v.w = width;
                            v.exe = exe;
                            v.args = args;
                            // 保存
                            const newData = new Map(data);
                            newData.set(settingKey, v);
                            setData(newData);
                            showOverlay(false);
                        }}>SAVE</button>
                        <hr className="my-4"/>
                        <button className="text-fail" onClick={() => setDeleteOverlay(
                            <div className="flex justify-center items-center h-full w-full">
                                <div className="bg-layerA p-4">
                                    <h1 className="text-2xl">本当に？</h1>
                                    <button className="text-fail" onClick={() => {
                                        deleteObject(settingKey);
                                        showOverlay(false);
                                    }}>削除</button>
                                </div>
                            </div>
                        )}>Delete</button>
                    </div>
                </div>
            </Overlay>
            {deleteOverlay}
        </div>
    );
}
