import { useEffect, useRef, useState } from "react";
import { CellData, CellObj, CellObjProps, getCellSize, GRID_SIZE, MARGIN_SIZE } from "./CellObj";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { getAppdataDirFile, Paths } from "~/util/path";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import Overlay from "~/components/Overlay";
import Setting from "~/components/Setting";
import { open } from "@tauri-apps/plugin-dialog";
import { FlintiaWindow } from "~/Flintia";
import { WInvoke } from "~/InvokeWrapper";
import { useStaticOverlay } from "~/hooks/useOverlay";
import { useKVState } from "~/hooks/useKVState";
import SVGButton from "~/components/SVGButton";
import { Line } from "~/components/Line";
import { ifPresent } from "~/util/util";
import { convertFileSrc } from "@tauri-apps/api/core";
import { ReactSVG } from "react-svg";

type CellType = "tile" | "label";
type SaveData = Map<string, TileData>;
type TileData = {
    type: CellType;
    label: string;
    exe?: string;
    exe_icon?: string;
    args?: string;
    custom_icon?: string;
} & CellData;




function Tile(props: CellObjProps & TileData) {
    const [img, setImg] = useState<string|undefined>(undefined);

    useEffect(() => {
        if (props.custom_icon) return setImg(props.custom_icon);
        if (props.exe_icon) return setImg(props.exe_icon);
        setImg(undefined);
    }, [props.exe_icon, props.custom_icon]);

    return (
        <CellObj {...props} title={props.label.where(props.w <= 1)}>
            <div className="bg-launcher-tile-bg h-full w-full relative active:bg-launcher-tile-bg-active hover:outline-3 outline-launcher-tile-hover-outline active:outline-0 -outline-offset-3">
                <div className="flex justify-center items-center h-full w-full">
                    {img && <img className={`h-full w-full max-w-12 p-1 object-contain ${"pt-0".where(props.w > 1)}`} src={img}/>}
                </div>
                {props.w > 1 && <span className="absolute bottom-0 text-[75%] pl-1 pb-0.5 wrap-anywhere">{props.label}</span>}
            </div>
        </CellObj>
    );
}

function Label(props: {center?: boolean} & CellObjProps & TileData) {
    const {center, ...rest} = props;
    return (
        <CellObj {...rest}>
            <div className={`
                duration-200 h-full w-full
                border-launcher-label-border hover:border-launcher-label-border-hover ${"border-b".where(!center)}
                ${"bg-launcher-label-bg-locked".where(props.locked ?? false)} ${"hover:bg-launcher-label-bg-locked-hover".where(props.locked ?? false)}
            `}>
                <span className="h-full flex text-[75%]" style={{
                    justifyContent: "center".where(!!center),
                    alignItems: center ? "center" : "end",
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

/**
 * 画像をリサイズし、base64で返します。先頭にMIMEタイプ付き。
 * @param src 画像ソース(convert済みを渡してください)
 * @param width エンコード後の画像幅
 * @param height エンコード後の画像高
 * @returns Base64の画像
 */
async function resizeImageToBase64(src: string, width: number=64, height: number=64): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = width;
            canvas.height = height;
            ctx?.drawImage(img, 0, 0, width, height);
            const base64 = canvas.toDataURL("image/png");
            resolve("data:image/png;base64," + base64);
        };
        img.onerror = e => reject(new Error("Failed to load image: " + e.toString()));
        img.src = src;
    });
}



const datafile = await getAppdataDirFile("launcher.json");

export default function LaunchPanel() {
    const loaded = useRef(false);
    const [data, setData] = useState<SaveData>(new Map());
    const [overlay, showOverlay] = useState(false);
    const [staticOverlay, setStaticOverlay] = useStaticOverlay();
    // settings
    const [settingKey, setSettingKey] = useState(String.empty);
    const [editData, setEditData, overwriteEditData] = useKVState<TileData>({
        h: 1,
        w: 1,
        label: "NULL",
        type: "tile",
        x: 0,
        y: 0,
    });
    const [isDir, setIsDir] = useState(false);

    useEffectAsync(async() => {
        if (await Paths.notExists(datafile)) return;
        // load
        const rawDataString = await readTextFile(datafile);
        const rawData = JSON.parse(rawDataString);
        // set
        const map: SaveData = new Map(Object.entries(rawData));
        setData(map);
        loaded.current = true;
    }, []);

    useEffectAsync(async() => {
        if (!loaded.current) return;
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
        overwriteEditData(v);
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
        setEditData("exe", select);
    }

    function openDeleteOverlay(label: string, callback: () => void) {
        setStaticOverlay(
            <div className="flex justify-center items-center h-full w-full">
                <div className="bg-layerA p-4 border border-fail">
                    <h1 className="text-2xl">本当に{ifPresent(label, it => it+"を")}削除しますか？</h1>
                    <button className="text-fail" onClick={callback}>削除</button>
                </div>
            </div>
        );
    }



    const settingOpenCellData = data.get(settingKey);

    return (
        <div className="h-full w-full overflow-x-scroll overflow-y-scroll" style={{padding: GRID_SIZE+(MARGIN_SIZE*3) + "px"}}>
            <div className="w-full h-full relative">
                <Label
                    {...{type: "label", label: "+", x: -1, y: -1, w: 1, h: 1}}
                    locked={true}
                    center={true}
                    onClick={() => addObject("tile")}
                    onRightClick={() => addObject("label")}
                />
                {/* TODO: 機能未実装 */ false && <CellObj
                    {...{type: "label", x: -1, y: (screen.availHeight/getCellSize())-1, w: 1, h: 1}}
                    locked={true}
                    className="bg-launcher-label-bg-locked hover:bg-launcher-label-bg-locked-hover"
                ><ReactSVG src="/settings.svg" className="h-full aspect-square fill-svg p-1"/></CellObj>}
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
                                await (await FlintiaWindow.getCurrentWindow()).hide();
                                await WInvoke.runExe(v.exe, v.args);
                            }}/>
                        case "label":
                            return <Label key={k} {...v} isOverlapping={v => isOverlapping(k, v)} onMoved={(x, y) => moveObject(k, v, x, y)} onRightClick={async() => openCellSetting(k)}/>
                    }
                })}
            </div>
            <Overlay show={overlay} setShow={showOverlay} grayBackground={false}>
                <div className="h-full w-full flex items-center justify-center">
                    <div className="flex flex-row bg-layerA p-4 gap-1 w-1/4 text-[0.75rem] border border-app-edge" onClick={e => e.stopPropagation()}>
                        <div className="flex flex-col grow">
                            <input placeholder="Label" type="text" value={editData.label} onChange={e => setEditData("label", e.currentTarget.value)}/>
                            <NumberSelector min={1} max={8} value={editData.h} label="Height" onChange={v => setEditData("h", v)}/>
                            <NumberSelector min={1} max={8} value={editData.w} label="Width" onChange={v => setEditData("w", v)}/>
                            <Line/>
                            {settingOpenCellData?.type == "tile" && <>
                                <Setting title="Oepn">
                                    <div className="flex flex-row">
                                        <button onClick={async() => selectExe(false)}>file</button>
                                        <button onClick={async() => selectExe(true)}>directory</button>
                                    </div>
                                </Setting>
                                {editData.exe}
                                {editData.exe && !isDir && <input placeholder="Arguments" value={editData.args} onChange={e => setEditData("args", e.currentTarget.value)}/>}
                                <Line/>
                            </>}
                            <div className="flex flex-row justify-between">
                                <div className="flex flex-row">
                                    <span className="pl-1">Custom-Icon</span>
                                    {editData.custom_icon && <img src={editData.custom_icon} className="aspect-square ml-2 h-5"/>}
                                </div>
                                <div className="flex flex-row w-2/5">
                                    {editData.custom_icon && <button className="grow" onClick={() => openDeleteOverlay("カスタムアイコン", () => setEditData("custom_icon", undefined))}>Reset</button>}
                                    <button className="grow" onClick={async() => {
                                        const imageExtension = ["png", "jpg", "jpeg", "webp"];
                                        const selectPath = await open({
                                            filters: [{
                                                extensions: ["*"],
                                                name: "any",
                                            }],
                                            title: "Select custom icon",
                                        });
                                        if (selectPath == null) return;
                                        const ext = Paths.splitExt(selectPath).ext;
                                        const base64 = await (async() => {
                                            // 画像ファイルならそのまま取得、非画像ファイルはファイルアイコンを取得
                                            if (imageExtension.includes(ext)) {
                                                // base64化
                                                const src = convertFileSrc(selectPath);
                                                return await resizeImageToBase64(src);
                                            }
                                            return await WInvoke.getFileIconBase64(selectPath, 32);
                                        })();
                                        setEditData("custom_icon", base64);
                                    }}>File</button>
                                </div>
                            </div>
                        </div>
                        <Line vertical/>
                        <div className="flex flex-col justify-between">
                            <SVGButton src="trash_can.svg" className="w-8 fill-fail" onClick={() => openDeleteOverlay(editData.label, () => {
                                deleteObject(settingKey);
                                showOverlay(false);
                            })}/>
                            <SVGButton src="refresh.svg" title="Clear Cache" onClick={() => {
                                editData.exe_icon = undefined;
                            }}/>
                            <SVGButton src="save.svg" onClick={async() => {
                                // exeアイコンのキャッシュを作成
                                if (editData.exe_icon == undefined && editData.exe) {
                                    const base64 = await WInvoke.getFileIconBase64(editData.exe, 32);
                                    editData.exe_icon = base64;
                                }
                                // 保存
                                const newData = new Map(data);
                                newData.set(settingKey, editData);
                                setData(newData);
                                showOverlay(false);
                            }}/>
                        </div>
                    </div>
                </div>
            </Overlay>
            {staticOverlay}
        </div>
    );
}
