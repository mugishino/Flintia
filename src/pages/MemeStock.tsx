import { convertFileSrc } from "@tauri-apps/api/core";
import { readDir } from "@tauri-apps/plugin-fs";
import Config from "~/Config";
import { WInvoke } from "~/InvokeWrapper";
import { Logger } from "~/Logger";
import { Clipboards } from "~/util/clipboard";
import { Paths } from "~/util/path";
import { useOverlay } from "~/util/react";

const SUPPORT_EXTENSION = "avif,bmp,jpeg,jpg,png,webp".split(",");

const config = await Config.load();

const imagePathList: string[] = [];
(await readDir(config.imagedir)).forEach(v => {
    if (!v.isFile) return;
    if (!SUPPORT_EXTENSION.includes(Paths.splitExt(v.name).ext)) return;
    imagePathList.push(convertFileSrc(`${config.imagedir}/${v.name}`));
});

export default function MemeStock() {
    const [overlay, setOverlay] = useOverlay();

    return (
        <div className="overflow-y-scroll flex flex-wrap justify-center">
            {imagePathList.map(v => <img key={v} src={v} onClick={async() => {
                const raw = await fetch(v);
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
                await WInvoke.paste();
            }} onAuxClick={() => {
                setOverlay(<img className="m-auto h-4/5" src={v}/>);
            }} decoding="async" loading="lazy" className={[
                `cursor-pointer object-cover h-1/6 grow outline-red-600`,
                `not-hover:opacity-80 hover:outline-2 hover:z-10 hover:object-contain`
            ].join(String.space)}/>)}
            {overlay}
        </div>
    );
}
