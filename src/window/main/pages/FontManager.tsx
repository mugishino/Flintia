import { convertFileSrc } from "@tauri-apps/api/core";
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import { useState } from "react";
import { Overlay } from "~/components/Overlay";
import { OverlayWindow } from "~/components/OverlayWindow";
import { Search } from "~/components/Search";
import { Setting } from "~/components/Setting";
import { ViewGroup } from "~/components/ViewGroup";
import { IS_INITIAL } from "~/Data";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { FontMetadata, WInvoke } from "~/InvokeWrapper";
import { getAppdataDirDir, getCacheDirDir, getCacheDirFile, Paths } from "~/util/path";
import { ifPresent, MOUSE_BUTTON_BITS, searchFilter } from "~/util/util";

const FONT_EXTENSIONS = ["ttf", "otf", "ttc", "woff", "woff2"];
// ここを変更する際はRust側も変更してください。
const PREVIEW_EXPORT_EXTENSION = ".webp";



const METADATA_CACHE_FILE = await getCacheDirFile("font-metadata.json");
const FONT_DIR = await getAppdataDirDir("fonts/");
const FONT_PREVIEW_DIR = await getCacheDirDir("font_preview/");

function FontViewColumn(props: {
    imageSource?: string,
    active?: boolean,
    data?: FontMetadata,
    onClick?: () => void,
    onRightClick?: () => void,
}) {
    return (
        <div className={
            `min-h-1/8 flex flex-col cursor-pointer py-2 m-2 mb-0
            hover:bg-font-disable hover:rounded-md duration-75
            hover:outline-border not-hover:shadow-[0_1px] shadow-border outline-1 outline-transparent
            ${"bg-font-enable hover:bg-font-enable-outline hover:outline-font-enable-outline rounded-md".where(!!props.active)}`} 
            onClick={props.onClick}
            onAuxClick={e => {
                if (e.button == MOUSE_BUTTON_BITS.RIGHT) props.onRightClick?.();
            }}>

            <div className="ml-2 flex flex-row gap-2 items-center">
                <span>{props.data?.full_name}</span>
                <span className="text-text-gray text-xs">{ifPresent(props.data?.variable, () => "Variable")}</span>
                <span className="text-text-gray text-xs">{props.data?.version}</span>
            </div>
            <div className={`grow flex items-center h-full min-h-0`}>
                {props.imageSource
                ? <img className="object-contain" src={props.imageSource} loading="lazy"/>
                : <span className="text-2xl font-bold italic ml-8">Loading...</span>
                }
            </div>
        </div>
    );
}

/**
 * フォントファイルのパスを全て取得します。
 * @returns 取得したフォントファイルの絶対パス
 */
export async function getFontFiles() {
    const dirFiles = await WInvoke.getRecursiveFiles(FONT_DIR);
    const fontFiles = dirFiles.filter(item => {
        if (FONT_EXTENSIONS.contains(Paths.splitExt(item).ext)) return true;
        return false;
    });
    return fontFiles;
}

type FontViewData = FontMetadata & {
    /** 生の画像パス */
    image: string,
    /** フォント自体のパス */
    font_path: string,
};



if (IS_INITIAL) {
    getFontFiles().then(fontFiles => {
        WInvoke.unregisterFonts(fontFiles);
    });
}

export function FontManager() {
    // core
    const [data, setData] = useState<FontViewData[]>([]);
    const [selectFonts, setSelectFonts] = useState<string[]>([]);
    const [loadedFonts, setLoadedFonts] = useState<string[]>([]);

    // UI
    const [imageReadyFonts, setImageReadyFonts] = useState<string[]>([]);
    const [search, setSearch] = useState(String.empty);

    // overlay
    const [overlayData, setOverlayData] = useState<FontViewData|undefined>(undefined);
    const [showInfo, setShowInfo] = useState(false);



    useEffectAsync(async() => {
        // 既に読み込み済みのフォントを登録
        (await WInvoke.getActiveFonts()).map(v => setLoadedFonts(v));

        // load cache
        const metadataCache = await readTextFile(METADATA_CACHE_FILE).then(v => JSON.toMap<string, FontMetadata>(v))
        // 初回時はファイルない
        .catch(() => new Map<string, FontMetadata>());

        // 読み込み
        const fontFiles = await getFontFiles();

        const alreadyPostscript: string[] = [];
        const metadataList = fontFiles.map(async (font): Promise<FontViewData|undefined> => {
            // データ解析
            const metadata = metadataCache.get(font) ?? (await WInvoke.parseFontMetadata(font)).unwrap();
            if (!metadata) {
                console.error("[Failed] parse font metadata: " + font);
                return;
            }

            // 検証
            if (metadata.post_script_name == undefined) return;
            const postScriptName = metadata.post_script_name;
            
            // キャッシュ
            metadataCache.set(font, metadata);

            // 重複チェック
            if (alreadyPostscript.contains(metadata.post_script_name)) return;
            alreadyPostscript.push(metadata.post_script_name);

            // プレビュー生成
            const output = Paths.join(FONT_PREVIEW_DIR, metadata.post_script_name + PREVIEW_EXPORT_EXTENSION);
            Paths.exists(output).then(async v => {
                if (v) return setImageReadyFonts(prev => [...prev, postScriptName]);
                const previewResult = await WInvoke.generateFontPreview(font, output, "メロスは激怒した。ABCDEFG 1234567890 +()!?@%&", 64, {
                    canvasWidth: 2048,
                });
                previewResult.map(() => {
                    setImageReadyFonts(prev => [...prev, postScriptName]);
                });
            });

            return {...metadata, image: output, font_path: font};
        });
        setData((await Promise.all(metadataList)).nullFilter());

        // キャッシュ保存
        writeTextFile(METADATA_CACHE_FILE, JSON.fromMap(metadataCache));
    }, []);

    async function updateFontRegister() {
        if (selectFonts.length == 0) return;

        // selectFontsから有効化・無効化するフォントを振り分け
        const activates: string[] = [];
        const disables: string[] = [];
        selectFonts.forEach(font => {
            if (loadedFonts.contains(font)) return disables.push(font);
            activates.push(font);
        });

        // state更新
        const newLoaded = [...loadedFonts, ...activates].filter(x => !disables.contains(x));
        setLoadedFonts(newLoaded);
        setSelectFonts([]);

        if (disables ) await WInvoke.unregisterFonts(disables);
        if (activates) await WInvoke.registerFonts(activates);
    }



    const viewData: (FontViewData & {
        loaded: boolean,
        select: boolean,
    })[] = data.map(data => {
        if (!searchFilter(search, data.full_name ?? String.empty)) return undefined;

        const loaded = loadedFonts.contains(data.font_path);
        const select = selectFonts.contains(data.font_path);
        return {...data, loaded, select};
    })
    .nullFilter()
    .sort((a, b) => (a.full_name??String.empty).localeCompare(b.full_name??String.empty));

    return (
        <>
            <div className="flex flex-row *:border-0 *:not-last:border-r border-b">
                <Search value={search} onUpdate={setSearch} className="w-full"/>
                <button onClick={() => openPath(FONT_DIR)}>Open Font Folder</button>
                <button className="not-disabled:text-enable" onClick={updateFontRegister} disabled={selectFonts.length == 0}>フォント読み込みを確定する</button>
            </div>
            <div className="flex flex-col h-full overflow-scroll">
                {viewData.map(v =>
                    <FontViewColumn
                        key={v.post_script_name}
                        imageSource={imageReadyFonts.contains(v.post_script_name) ? convertFileSrc(v.image) : String.empty}
                        active={v.select ? !v.loaded : v.loaded}
                        data={v}
                        onClick={() => {
                            let newSelects = selectFonts;
                            if (!v.select) newSelects.push(v.font_path);
                            else newSelects = newSelects.filter(x => x != v.font_path);
                            setSelectFonts([...newSelects]);
                        }}
                        onRightClick={() => {
                            setOverlayData(v);
                            setShowInfo(false);
                        }}
                    />
                )}
            </div>
            <Overlay show={!!overlayData} setShow={() => setOverlayData(undefined)}>
                <OverlayWindow className="w-1/2 h-4/5 rounded-md">
                    <span className="text-4xl pl-1 hover:bg-hover rounded-md mb-2 duration-100 cursor-pointer" onClick={() => setShowInfo(!showInfo)}>{overlayData?.full_name}</span>
                    <ViewGroup show={!showInfo}>
                        WIP : タグ設定等
                    </ViewGroup>
                    <ViewGroup className="grow flex flex-col gap-2 [&>div]:border-b" show={showInfo}>
                        <Setting title="Version">{overlayData?.version}</Setting>
                        <Setting title="Family name">{overlayData?.family_name}</Setting>
                        <Setting title="Sub family name">{overlayData?.subfamily_name}</Setting>
                        <Setting title="Post script name">{overlayData?.post_script_name}</Setting>
                        <Setting title="Monospaced">{String(overlayData?.monospaced)}</Setting>
                        <Setting title="Variable">{String(overlayData?.variable)}</Setting>
                        <div className={`grow border bg-layerB p-1 overflow-y-scroll select-text ${overlayData?.license || "text-text-gray"}`}>{overlayData?.license ?? "NO LICENSE DESCRIPTION"}</div>
                        <span className="w-full text-center">{overlayData?.copyright}</span>
                    </ViewGroup>
                </OverlayWindow>
            </Overlay>
        </>
    );
}
