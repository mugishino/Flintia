import { readDir } from "@tauri-apps/plugin-fs";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { WInvoke } from "~/InvokeWrapper";
import { getAppdataDirFile } from "~/util/path";

export function FontManager() {
    useEffectAsync(async() => {
        // テスト中
        const fontDir = await getAppdataDirFile("fonts/");
        const fontList = await readDir(fontDir);
        fontList.forEach(async font => {
            if (font.name.endsWith(".png")) return;
            const fontFile = fontDir + "/" + font.name;
            const metadata = await WInvoke.parseFontMetadata(fontFile);
            metadata.map(async v => {
                console.log(v);
                const result =  await WInvoke.generateFontPreview(fontFile, fontDir + "/" + font.name + ".png", "Windowsで世界が広がります。", 80);
                result.map(() => console.log("プレビュー出力成功: " + v.family_name)).map_err(e => console.log(e));
            })
        });
    });

    return (
        <>
            <button className="border-0 border-b">Open Font Folder</button>
        </>
    );
}
