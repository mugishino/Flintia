import { convertFileSrc } from "@tauri-apps/api/core";
import { readDir } from "@tauri-apps/plugin-fs";
import { Config } from "~/Config";
import { WInvoke } from "~/InvokeWrapper";
import { Paths } from "~/util/path";
import { useStaticOverlay } from "~/hooks/useOverlay";
import { useState } from "react";
import { useEffectAsync } from "~/hooks/useEffectAsync";
import { AppStorage } from "~/module/AppStorage";
import { Logger } from "~/module/Logger";

const SUPPORT_EXTENSION = "png,jpg,jpeg,bmp,webp,avif,gif".split(",");

export function MemeStock_Image({paste, enter, search}: {paste: boolean, enter: boolean, search: string}) {
    const [imageList, setImageList] = useState<string[]>([]);
    const [errMsg, setErrMsg] = useState<string|undefined>(undefined);

    const [overlay, setOverlay] = useStaticOverlay();

    useEffectAsync(async() => {
        const config = await AppStorage.load(new Config());
        const imagedirNotFound = await Paths.notExists(config.imagedir);
        if (imagedirNotFound) return setErrMsg("Directory not found");

        const data = (await readDir(config.imagedir)).map(v => {
            if (!v.isFile) return;
            if (!SUPPORT_EXTENSION.includes(Paths.splitExt(v.name).ext)) return;
            return `${config.imagedir}/${v.name}`;
        });
        setImageList(data.filter(v => v != undefined));
    });

    return (
        <div className="overflow-y-scroll flex flex-wrap justify-center content-start h-full">
            <span className="text-2xl text-fail">{errMsg}</span>
            {imageList.map(rawFilePath => {
                const fileSrc = convertFileSrc(rawFilePath);
                if (search.length != 0 && !Paths.getBasename(rawFilePath.toLowerCase()).includes(search.toLowerCase())) return;
                return (
                    <img key={rawFilePath} src={fileSrc} onClick={async() => {
                        (await WInvoke.clipboardCopyfile(rawFilePath))
                        .onFailure(v => Logger.warning(v))
                        .onSuccessAsync(async() => {
                            if (paste) await WInvoke.paste(enter);
                        });
                    }} onAuxClick={() => {
                        setOverlay(<img className="m-auto h-4/5" src={fileSrc}/>);
                    }} decoding="async" loading="lazy" className={[
                        `cursor-pointer object-cover min-h-1/6 max-h-1/6 grow outline-memestock-hover-image-outline`,
                        `not-hover:opacity-80 hover:outline-2 hover:z-10`
                    ].join(String.space)}/>
                );
            })}
            <div className="grow-100 min-h-px text-[0px]">最終行の余白と検索時の画像サイズ調整用</div>
            {overlay}
        </div>
    );
}
