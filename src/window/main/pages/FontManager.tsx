import { convertFileSrc } from "@tauri-apps/api/core";
import { readDir } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import { useState } from "react";
import { IS_INITIAL } from "~/Data";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { WInvoke } from "~/InvokeWrapper";
import { getAppdataDirDir, getAppdataDirFile, getCacheDirDir, Paths } from "~/util/path";

const FONT_EXTENSIONS = ["ttf", "otf", "ttc", "woff", "woff2"];
// ここを変更する際はRust側も変更してください。
const PREVIEW_EXPORT_EXTENSION = ".webp";



if (IS_INITIAL) {
    getFontFiles().then(fontFiles => {
        WInvoke.unregisterFonts(fontFiles);
    });
}



const FONT_DATA_FILE = await getAppdataDirFile("fonts.json");
const FONT_DIR = await getAppdataDirDir("fonts/");
const FONT_PREVIEW_DIR = await getCacheDirDir("font_preview/");

function FontViewColumn(props: {
    imageSource?: string,
    active?: boolean,
    onClick?: () => void,
}) {
    return (
        <div className={`h-1/10 border-b flex flex-col cursor-pointer ${"bg-enable-overlay".where(!!props.active)}`} onClick={props.onClick}>
            <div className="grow flex items-center">
                <img src={props.imageSource ?? String.empty}/>
            </div>
        </div>
    );
}

/**
 * フォントファイルのパスを全て取得します。
 * @returns 取得したフォントファイルの絶対パス
 */
export async function getFontFiles() {
    const dirFiles = await readDir(FONT_DIR);
    const fontFiles = dirFiles.filter(item => {
        if (!item.isFile) return false;
        if (FONT_EXTENSIONS.contains(Paths.splitExt(item.name).ext)) return true;
        return false;
    }).map(v => FONT_DIR + v.name);
    return fontFiles;
}

type FontViewData = WInvoke.FontMetadata & {
    /** 生の画像パス */
    image: string,
    /** フォント自体のパス */
    font_path: string,
};

export function FontManager() {
    const [data, setData] = useState<FontViewData[]>([]);
    const [selectFonts, setSelectFonts] = useState<string[]>([]);
    const [loadedFonts, setLoadedFonts] = useState<string[]>([]);

    useEffectAsync(async() => {
        // 既に読み込み済みのフォントを登録
        (await WInvoke.getActiveFonts()).map(v => setLoadedFonts(v));

        // 読み込み
        const fontFiles = await getFontFiles();

        const metadataList = fontFiles.map(async (font): Promise<FontViewData|undefined> => {
            // データ解析
            const parseResult = await WInvoke.parseFontMetadata(font);
            if (parseResult.isErr) {
                console.error("[Failed] parse font metadata: " + font);
                return undefined;
            }
            const metadata = parseResult.unwrap()!;

            // プレビュー生成
            const output = Paths.join(FONT_PREVIEW_DIR, metadata.post_script_name + PREVIEW_EXPORT_EXTENSION);
            if (await Paths.notExists(output)) {
                await WInvoke.generateFontPreview(font, output, "メロスは激怒した。ABCDEFG 1234567890 +()!?@%&", 80, {
                    canvasWidth: 2048,
                });
            }

            return {...metadata, image: output, font_path: font};
        });
        setData((await Promise.all(metadataList)).nullFilter());
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
        const loaded = loadedFonts.contains(data.font_path);
        const select = selectFonts.contains(data.font_path);
        return {...data, loaded, select};
    });

    return (
        <>
            <div className="flex flex-row border-b *:border-0 *:not-last:border-r">
                <button onClick={() => openPath(FONT_DIR)}>Open Font Folder</button>
                <button className="text-enable" onClick={updateFontRegister}>フォント読み込みを確定する</button>
            </div>
            <div className="flex flex-col h-full">
                {viewData.map(v => 
                    <FontViewColumn
                        key={v.post_script_name} 
                        imageSource={convertFileSrc(v.image)} 
                        active={v.select ? !v.loaded : v.loaded}
                        onClick={() => {
                            let newSelects = selectFonts;
                            if (!v.select) newSelects.push(v.font_path);
                            else newSelects = newSelects.filter(x => x != v.font_path);
                            setSelectFonts([...newSelects]);
                        }}
                    />
                )}
            </div>
        </>
    );
}
