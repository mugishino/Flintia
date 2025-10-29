import { convertFileSrc } from "@tauri-apps/api/core";
import { readDir } from "@tauri-apps/plugin-fs";
import Config from "~/Config";
import { WInvoke } from "~/InvokeWrapper";
import { Logger } from "~/Logger";
import { Clipboards } from "~/util/clipboard";
import { Paths } from "~/util/path";
import useOverlay from "~/hooks/useOverlay";

const SUPPORT_EXTENSION = "avif,bmp,jpeg,jpg,png,webp".split(",");

const config = await Config.load();
const imagedirNotFound = await Paths.notExists(config.imagedir);

const imageList: string[] = [];
if (!imagedirNotFound) {
    const imagedirAllFiles = await readDir(config.imagedir);
    imagedirAllFiles.forEach(v => {
        if (!v.isFile) return;
        if (!SUPPORT_EXTENSION.includes(Paths.splitExt(v.name).ext)) return;
        imageList.push(`${config.imagedir}/${v.name}`);
    });
}

export default function MemeStock_Image({paste, enter, search}: {paste: boolean, enter: boolean, search: string}) {
    const [overlay, setOverlay] = useOverlay();

    return (
        <div className="overflow-y-scroll flex flex-wrap justify-center content-start h-full">
            <span className="text-2xl text-fail">{"Image directory not found".where(imagedirNotFound)}</span>
            {imageList.map(v => {
                const fileSrc = convertFileSrc(v);
                if (search.length != 0 && !Paths.getBasename(v.toLowerCase()).includes(search.toLowerCase())) return;
                return (
                    <img key={v} src={fileSrc} onClick={async() => {
                        const raw = await fetch(fileSrc);
                        const blob = await raw.blob();
                        // canvas
                        const canvas = document.createElement("canvas");
                        const ctx = canvas.getContext("2d");
                        if (!ctx) return Logger.failed("get canvas context");
                        const img = await createImageBitmap(blob);
                        canvas.width = img.width;
                        canvas.height = img.height;
                        ctx.drawImage(img, 0, 0);
                        // copy and paste
                        const success = await Clipboards.copyFromCanvas(canvas);
                        if (!success) return Logger.failed("copy image to clipboard");
                        if (paste) await WInvoke.paste(enter);
                    }} onAuxClick={() => {
                        setOverlay(<img className="m-auto h-4/5" src={fileSrc}/>);
                    }} decoding="async" loading="lazy" className={[
                        `cursor-pointer object-cover min-h-1/6 max-h-1/6 grow outline-red-600`,
                        `not-hover:opacity-80 hover:outline-2 hover:z-10 hover:object-contain`
                    ].join(String.space)}/>
                );
            })}
            <div className="grow-100 min-h-px text-[0px]">最終行の余白と検索時の画像サイズ調整用</div>
            {overlay}
        </div>
    );
}
