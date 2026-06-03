import { convertFileSrc } from "@tauri-apps/api/core";
import { readDir } from "@tauri-apps/plugin-fs";
import { openPath } from "@tauri-apps/plugin-opener";
import { useState } from "react";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { WInvoke } from "~/InvokeWrapper";
import { getAppdataDirDir, getAppdataDirFile, getCacheDirDir, Paths } from "~/util/path";

const FONT_EXTENSIONS = ["ttf", "otf", "ttc", "woff", "woff2"];
// ここを変更する際はRust側も変更してください。
const PREVIEW_EXPORT_EXTENSION = ".webp";



const FONT_DATA_FILE = await getAppdataDirFile("fonts.json");
const FONT_DIR = await getAppdataDirDir("fonts/");
const FONT_PREVIEW_DIR = await getCacheDirDir("font_preview/");

function FontViewColumn(props: {
    imageSource: string,
}) {
    return (
        <div className="h-1/10 border-b flex flex-col">
            <div className="grow flex items-center">
                <img src={props.imageSource}/>
            </div>
        </div>
    );
}

type FontViewData = WInvoke.FontMetadata & {
    /** 生の画像パス */
    image: string
};

export function FontManager() {
    const [data, setData] = useState<FontViewData[]>([]);

    useEffectAsync(async() => {
        const fontFiles = (await readDir(FONT_DIR)).filter(v => {
            if (!v.isFile) return false;
            if (FONT_EXTENSIONS.contains(Paths.splitExt(v.name).ext)) return true;
            return false;
        }).map(v => FONT_DIR + v.name);

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

            return {...metadata, image: output};
        });
        setData((await Promise.all(metadataList)).nullFilter());
    }, []);

    return (
        <>
            <button className="border-0 border-b" onClick={() => openPath(FONT_DIR)}>Open Font Folder</button>
            <div className="flex flex-col h-full">
                {data.map(v =>
                    <FontViewColumn key={v.post_script_name} imageSource={convertFileSrc(v.image)}/>
                )}
            </div>
        </>
    );
}
